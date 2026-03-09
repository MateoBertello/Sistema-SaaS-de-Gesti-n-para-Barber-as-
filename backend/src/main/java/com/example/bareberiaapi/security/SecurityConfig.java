package com.example.bareberiaapi.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://localhost:5173",
                "http://localhost"
        ));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        // RUTAS PUBLICAS
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/auth/register").permitAll()

                        // SOLO DUENO
                        .requestMatchers("/api/auth/crear-staff").hasRole("DUEÑO")
                        .requestMatchers(HttpMethod.POST,   "/api/sucursales/**").hasRole("DUEÑO")
                        .requestMatchers(HttpMethod.PUT,    "/api/sucursales/**").hasRole("DUEÑO")
                        .requestMatchers(HttpMethod.DELETE, "/api/sucursales/**").hasRole("DUEÑO")
                        .requestMatchers(HttpMethod.POST,   "/api/servicios/**").hasRole("DUEÑO")
                        .requestMatchers(HttpMethod.PUT,    "/api/servicios/**").hasRole("DUEÑO")
                        .requestMatchers(HttpMethod.DELETE, "/api/servicios/**").hasRole("DUEÑO")
                        .requestMatchers(HttpMethod.GET,    "/api/usuarios").hasRole("DUEÑO")
                        .requestMatchers(HttpMethod.DELETE, "/api/usuarios/**").hasRole("DUEÑO")
                        .requestMatchers(HttpMethod.POST,   "/api/horarios/**").hasRole("DUEÑO")
                        .requestMatchers(HttpMethod.DELETE, "/api/horarios/**").hasRole("DUEÑO")

                        // DUENO Y BARBERO
                        .requestMatchers(HttpMethod.PUT, "/api/turnos/**").hasAnyRole("DUEÑO", "BARBERO", "CLIENTE")
                        .requestMatchers(HttpMethod.POST, "/api/turnos/walkin").hasAnyRole("DUEÑO", "BARBERO")

                        // CUALQUIER AUTENTICADO
                        .requestMatchers(HttpMethod.GET, "/api/usuarios/barberos").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/turnos").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/turnos").hasAnyRole("CLIENTE", "DUEÑO", "BARBERO")
                        .requestMatchers(HttpMethod.GET, "/api/sucursales/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/servicios/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/horarios/**").authenticated()

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}