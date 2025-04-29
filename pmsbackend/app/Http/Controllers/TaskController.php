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

    // app/Http/Controllers/TaskController.php

public function store(Request $request)
{
    $request->validate([
        'title' => 'required',
        'project_id' => 'required|exists:projects,id',
        'description' => 'nullable|string',
        'assigned_to' => 'nullable|exists:users,id',
        'status' => 'in:todo,in_progress,completed',
        'priority' => 'in:low,medium,high',
        'start_date' => 'nullable|date',
        'due_date' => 'nullable|date',
        'time_spent' => 'nullable|numeric',
    ]);

    $task = Task::create([
        'title' => $request->title,
        'description' => $request->description,
        'project_id' => $request->project_id,
        'assigned_to' => $request->assigned_to,
        'status' => $request->status,
        'priority' => $request->priority,
        'start_date' => $request->start_date,
        'due_date' => $request->due_date,
        'time_spent' => $request->time_spent ?? 0,
    ]);

    return response()->json($task, 201);
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

    public function assignUser($taskId, Request $request)
    {
        $task = Task::findOrFail($taskId);
        $userId = $request->input('assigned_to');

        $task->assigned_to = $userId;
        $task->save();

        return response()->json(['message' => 'Task assigned successfully']);
    }

    public function assignUsers($taskId, Request $request)
    {
        $request->validate([
            'assigned_to' => 'required|array',
            'assigned_to.*' => 'exists:users,id',
        ]);

        $task = Task::findOrFail($taskId);
        $task->users()->sync($request->input('assigned_to'));

        return response()->json(['message' => 'Users assigned to task successfully']);
    }
}
