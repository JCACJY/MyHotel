package com.demo.ai.myhotel.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class ApiLoggingInterceptor implements HandlerInterceptor {

    private static final Logger LOGGER = LoggerFactory.getLogger(ApiLoggingInterceptor.class);
    private static final String START_TIME_ATTRIBUTE = ApiLoggingInterceptor.class.getName() + ".startTime";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        request.setAttribute(START_TIME_ATTRIBUTE, System.currentTimeMillis());
        LOGGER.info("API request started method={} path={} query={}",
                request.getMethod(),
                request.getRequestURI(),
                queryString(request));
        return true;
    }

    @Override
    public void afterCompletion(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler,
            Exception ex
    ) {
        var startTime = request.getAttribute(START_TIME_ATTRIBUTE);
        long durationMs = startTime instanceof Long startedAt
                ? System.currentTimeMillis() - startedAt
                : -1;
        if (ex == null) {
            LOGGER.info("API request completed method={} path={} status={} durationMs={}",
                    request.getMethod(),
                    request.getRequestURI(),
                    response.getStatus(),
                    durationMs);
        } else {
            LOGGER.warn("API request completed method={} path={} status={} durationMs={} exception={}",
                    request.getMethod(),
                    request.getRequestURI(),
                    response.getStatus(),
                    durationMs,
                    ex.getClass().getSimpleName());
        }
    }

    private String queryString(HttpServletRequest request) {
        var query = request.getQueryString();
        return query == null ? "" : query;
    }
}
