package com.example.dto;

import java.time.LocalDate;
import java.util.List;

public class MovieRequest {
    public String title;
    public String description;
    public Integer duration;
    public String poster_url;
    public LocalDate release_date;
    
    // Mảng chứa ID của các thể loại (VD: [1, 2, 5])
    public List<Integer> genre_ids; 
}