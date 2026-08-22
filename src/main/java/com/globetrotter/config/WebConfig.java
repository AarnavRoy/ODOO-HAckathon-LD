package com.globetrotter.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.PathRequest;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // Allow public access to React build files
                .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()
                .requestMatchers("/", "/index.html", "/favicon.ico").permitAll()
                .requestMatchers("/assets/**", "/static/**", "/dist/**").permitAll()
                .requestMatchers("/**/*.js", "/**/*.css", "/**/*.png", "/**/*.jpg", "/**/*.svg", "/**/*.woff2").permitAll()
                // Allow public API endpoints (login/register)
                .requestMatchers("/api/auth/**", "/api/public/**", "/api/cities").permitAll()
                // Secure everything else
                .anyRequest().authenticated()
            )
            .formLogin(form -> form.disable());

        return http.build();
    }
}   
