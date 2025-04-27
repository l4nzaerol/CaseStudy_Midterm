<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index()
    {
        return Task::all();
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required',
            'project_id' => 'required|exists:projects,id',
            'status' => 'in:todo,in_progress,completed',
            'priority' => 'in:low,medium,high',
        ]);

        return Task::create($request->all());
    }

    public function show(Task $task)
    {
        return $task;
    }

    public function update(Request $request, Task $task)
    {
        $task->update($request->all());
        return $task;
    }

    public function destroy(Task $task)
    {
        $task->delete();
        return response()->json(['message' => 'Task deleted']);
    }

    // In TaskController.php
public function assignUser($taskId, Request $request)
{
    $task = Task::findOrFail($taskId);
    $userId = $request->input('assigned_to');

    // Update the task's assigned user
    $task->assigned_to = $userId;
    $task->save();

    return response()->json(['message' => 'Task assigned successfully']);
}

public function assignUsers($taskId, Request $request)
{
    // Validate the input
    $request->validate([
        'assigned_to' => 'required|array',  // Make sure it's an array
        'assigned_to.*' => 'exists:users,id',  // Ensure all IDs exist in the users table
    ]);

    // Find the task by ID
    $task = Task::findOrFail($taskId);

    // Attach the users to the task
    $task->users()->sync($request->input('assigned_to'));  // This will replace current users with the new ones

    return response()->json(['message' => 'Users assigned to task successfully']);
}


}
