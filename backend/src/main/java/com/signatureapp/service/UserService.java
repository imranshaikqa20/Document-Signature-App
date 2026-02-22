package com.signatureapp.service;

import com.signatureapp.dto.RegisterRequest;
import com.signatureapp.dto.UserResponse;

public interface UserService {

    UserResponse register(RegisterRequest request);
}
