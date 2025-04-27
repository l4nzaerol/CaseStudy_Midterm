<?php

namespace App\Http\Controllers\api;

use App\Models\Task;
use App\Models\Project;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($projectId)
    {
        $project = Project::with('users')->findOrFail($projectId);
        $authUser = Auth::user();

        $isProjectCreator = $project->user_id === $authUser->id;
        $isProjectMember = $project->users->contains($authUser->id);

        if (!$isProjectCreator && !$isProjectMember) {
            return response()->json(['error' => 'Unauthorized to view this project\'s tasks.'], 403);
        }

        $tasks = $project->tasks; // assuming Project hasMany(Task)

        return response()->json($tasks);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'status' => 'in:todo,in_progress,done',
            'priority' => 'in:low,medium,high',
            'project_id' => 'required|exists:projects,id',
        ]);
    
        $project = Project::findOrFail($request->project_id);
    
        if ($project->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
    
        $task = Task::create([
            'name' => $request->name,
            'description' => $request->description,
            'status' => $request->status ?? 'todo',
            'priority' => $request->priority ?? 'medium',
            'project_id' => $request->project_id,
        ]);
    
        return response()->json($task, 201);
    }


    /**
     * Display the specified resource.
     */
    public function show(Task $task)
    {
        $project = $task->project;
        $authUser = Auth::user();
    
        $isProjectCreator = $project->user_id === $authUser->id;
        $isProjectMember = $project->users->contains($authUser->id);
    
        if (!$isProjectCreator && !$isProjectMember) {
            return response()->json(['error' => 'Unauthorized to view this task.'], 403);
        }
    
        return response()->json($task);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Task $task)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'status' => 'sometimes|in:todo,in_progress,done',
            'priority' => 'sometimes|in:low,medium,high',
            'assigned_to' => 'sometimes|nullable|exists:users,id',
        ]);

        $project = $task->project;

        $authUser = Auth::user();
        $isProjectCreator = $project->user_id === $authUser->id;
        $isAssignedUser = $task->assigned_to === $authUser->id;

        // If assigned user is marking task as done
        if ($isAssignedUser && $request->status === 'done') {
            $task->status = 'done';
            $task->save();
            return response()->json(['message' => 'Task marked as completed by assignee.'], 200);
        }

        // Prevent assigned user from undoing the task
        if ($isAssignedUser && $task->status === 'done' && $request->status !== 'done') {
            return response()->json(['error' => 'You are not allowed to undo the task.'], 403);
        }

        // Only project creator or the one who assigned can update the rest
        if (!$isProjectCreator && $task->user_id !== $authUser->id) {
            return response()->json(['error' => 'Unauthorized.'], 403);
        }

        // Optional: validate assigned_to is in project
        if ($request->has('assigned_to') && $request->assigned_to && !$project->users->contains($request->assigned_to)) {
            return response()->json(['error' => 'Assigned user is not a member of the project'], 422);
        }

        // If undoing a task (changing from done to something else), only project creator can do it
        if ($request->has('status') && $task->status === 'done' && $request->status !== 'done' && !$isProjectCreator) {
            return response()->json(['error' => 'Only the project creator can undo a completed task.'], 403);
        }

        // Update fields
        $task->update($request->only([
            'name',
            'description',
            'status',
            'priority',
            'assigned_to',
        ]));

        return response()->json(['message' => 'Task updated successfully.', 'task' => $task], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}