package com.foodorder;

import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;

public class FoodApp extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        out.println("<html><body>");
        out.println("<h1>Welcome to Food Order App!</h1>");
        out.println("<p>Current time: " + new java.util.Date() + "</p>");
        out.println("</body></html>");
    }
}
