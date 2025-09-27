package com.jplearning.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import java.util.Arrays;

@Configuration
public class SwaggerConfig {
    
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .servers(Arrays.asList(
                    new Server().url("https://backendlearning.xyz").description("HTTPS Server")
                ))
                .info(new Info()
                        .title("Japanese Learning API")
                        .version("1.0")
                        .description("API Documentation"));
    }
}
