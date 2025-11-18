package com.RizSafProjectManager.ProjectManager.Services;

import com.RizSafProjectManager.ProjectManager.Models.User;
import com.RizSafProjectManager.ProjectManager.Repos.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String getIdfromUsername(String username) {
        Long userId = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found for username: " + username))
                .getId();
        return userId.toString();
    }

    public User getUserByUsername(String username) {
        return userRepository.findByEmail(username).get();
    }
}
