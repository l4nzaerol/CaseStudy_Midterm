<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Project and Task CRUD
    Route::apiResource('projects', ProjectController::class);
    Route::post('projects/{project}/addMember', [ProjectController::class, 'addMember']);
    Route::delete('projects/{project}/removeMember', [ProjectController::class, 'removeMember']);

    // Route to get members of a specific project
    Route::get('projects/{project}/members', [ProjectController::class, 'getMembers']); // New route for getting project members

    Route::apiResource('tasks', TaskController::class);
    Route::post('/tasks/{taskId}/assign', [TaskController::class, 'assignUsers']);


    // User routes
    Route::get('/team-members', [UserController::class, 'teamMembers']);
});
