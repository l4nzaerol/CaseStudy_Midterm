<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // Fetch all users (default)
    public function index()
    {
        return response()->json(User::all());
    }

    // Fetch only team members
    public function teamMembers()
    {
        $teamMembers = User::where('role', 'team_member')->get();
        return response()->json($teamMembers);
    }

    // Optionally: Fetch a single user (if needed in the future)
    public function show($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($user);
    }
}
