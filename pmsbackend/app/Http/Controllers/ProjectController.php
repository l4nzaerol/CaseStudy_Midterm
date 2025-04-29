<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    public function index()
    {
        return Project::where('user_id', Auth::id())->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $project = Project::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'] ?? null,
            'status' => 'planning',
            'user_id' => Auth::id(),
        ]);

        return response()->json($project, 201);
    }

    public function show(Project $project)
    {
        // Check if user owns the project
        if ($project->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $project;
    }

    public function update(Request $request, Project $project)
    {
        if ($project->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'sometimes|required|string',
        ]);

        $project->update($validated);

        return response()->json($project);
    }

    public function destroy(Project $project)
    {
        if ($project->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $project->delete();

        return response()->json(['message' => 'Deleted']);
    }

    // In ProjectController.php
public function addMember($projectId, Request $request)
{
    $userId = $request->input('user_id');
    $project = Project::findOrFail($projectId);
    $user = User::findOrFail($userId);

    // Add the user to the project (e.g., using a pivot table)
    $project->users()->attach($user);

    return response()->json(['message' => 'User added to project successfully']);
}

public function getMembers(Project $project)
{
    // Assuming you have a relationship in the Project model called 'members'
    return response()->json($project->members);
}

public function updateActualCost(Request $request, $id)
{
    $validated = $request->validate([
        'actual_cost' => 'required|numeric|min:0',
    ]);

    $project = Project::findOrFail($id);

    if ($project->user_id !== Auth::id()) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $project->actual_cost = $validated['actual_cost'];
    $project->save();

    return response()->json($project);
}


}
