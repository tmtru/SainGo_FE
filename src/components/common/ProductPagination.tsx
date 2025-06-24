import React from 'react';
import { Pagination } from '@mui/material';

interface ProductPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const ProductPagination: React.FC<ProductPaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
}) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
            <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, page) => onPageChange(page)}
                color="primary"
                shape="rounded"
                showFirstButton
                showLastButton
            />
        </div>
    );
};

export default ProductPagination;
