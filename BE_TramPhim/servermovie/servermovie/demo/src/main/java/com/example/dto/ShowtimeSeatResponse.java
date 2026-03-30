package com.example.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShowtimeSeatResponse {

    private Integer seat_id;
    private Integer room_id;
    private String seat_number;
    private String status;
}
