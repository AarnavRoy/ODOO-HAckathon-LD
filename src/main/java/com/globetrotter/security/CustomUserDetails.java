package com.globetrotter.security;

import com.globetrotter.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.Collections;

public class CustomUserDetails implements UserDetails {
    private Long id;
    private String email;
    private String username;
    private String password;
    private User user;

    public CustomUserDetails(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.username = user.getUsername() != null && !user.getUsername().isBlank() ? user.getUsername() : user.getEmail();
        this.password = user.getPasswordHash();
        this.user = user;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getEmail() { return email; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptyList();
    }

    @Override
    public String getPassword() { return password; }

    @Override
    public String getUsername() { return username != null ? username : email; }

    @Override
    public boolean isAccountNonExpired() { return true; }
    @Override
    public boolean isAccountNonLocked() { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return true; }
}
