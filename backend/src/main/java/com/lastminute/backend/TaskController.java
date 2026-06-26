package com.lastminute.backend;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/prioritize")
    public String prioritizeTasks(@RequestBody Map<String, String> request) {
        String tasks = request.get("tasks");
        String prompt = "I have these tasks: " + tasks + ". Prioritize them by urgency and importance. Give each task a priority level (HIGH/MEDIUM/LOW), estimated time to complete, and a brief action plan. Format it clearly and concisely.";
        return geminiService.callGemini(prompt);
    }

    @PostMapping("/schedule")
    public String scheduleTasks(@RequestBody Map<String, String> request) {
        String tasks = request.get("tasks");
        String prompt = "Create a realistic daily schedule for these tasks: " + tasks + ". Include time blocks, short breaks, and 2-3 productivity tips. Format as a clear timetable.";
        return geminiService.callGemini(prompt);
    }

    @PostMapping("/chat")
    public String chat(@RequestBody Map<String, String> request) {
        String message = request.get("tasks");
        String prompt = "You are a helpful AI productivity companion. The user says: " + message + ". Give a helpful, concise response focused on productivity, task management, and getting things done.";
        return geminiService.callGemini(prompt);
    }
}