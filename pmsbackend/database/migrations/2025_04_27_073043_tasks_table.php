<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade'); // <-- cascade delete if project deleted
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null'); // <-- nullable + set null on user deletion
            $table->string('status')->default('todo'); // example statuses: todo, in_progress, done
            $table->string('priority')->default('medium'); // example priorities: low, medium, high
            $table->date('due_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
