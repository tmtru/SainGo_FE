"use client";

import React from "react";
import { Box, CircularProgress } from "@mui/material";

const CustomLoader: React.FC = () => {
    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight="250px"
        >
            <CircularProgress size={40} thickness={4} color="inherit" />
        </Box>
    );
};

export default CustomLoader;
