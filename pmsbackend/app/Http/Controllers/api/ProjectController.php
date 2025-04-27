<?php

namespace App\Http\Controllers\api;

use App\Models\Project;
use Illuminate\Http\Request;
use App\Models\TeamAssignment;
use App\Http\Controllers\Controller;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'budget' => 'nullable|numeric',
            'status' => 'nullable|string'
        ]);
    
        $project = Project::create([
            'name' => $request->name,
            'description' => $request->description,
            'owner_id' => auth()->id(), // ✅ correct
            'budget' => $request->budget,
            'status' => $request->status,
        ]);
    
        // Assign the owner as a team member
        TeamAssignment::create([
            'project_id' => $project->id,
            'user_id' => auth()->id(),
        ]);
    
        return response()->json([
            'message' => 'Project created!',
            'project' => $project
        ]);
        
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $project = Project::findOrFail($id);

        if ($project->owner_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'budget' => 'nullable|numeric',
            'status' => 'nullable|string',
        ]);

        $project->update($request->only(['name', 'description', 'budget', 'status']));

        return response()->json(['message' => 'Project updated successfully.']);
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $project = Project::findOrFail($id);

        if ($project->owner_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $project->delete();

        return response()->json(['message' => 'Project deleted successfully.']);
    }


    public function addMember(Request $request, $projectId)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $project = Project::findOrFail($projectId);

        // Prevent duplicate entry
        $exists = TeamAssignment::where('project_id', $projectId)
            ->where('user_id', $request->user_id)
            ->exists();

        if (!$exists) {
            TeamAssignment::create([
                'project_id' => $projectId,
                'user_id' => $request->user_id,
            ]);
        }

        return back()->with('success', 'User added to project');
    }

    public function getMyProjects()
    {
        $userId = auth()->id();
    
        $projects = Project::whereHas('members', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })->get();
    
        return response()->json($projects);
    }


}