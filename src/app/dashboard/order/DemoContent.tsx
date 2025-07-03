"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { useRouter } from "next/navigation";
import OrderService, { Order } from "@/data/Services/OrderService";

const OverviewTable: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterText, setFilterText] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await OrderService.getAllOrdersAdmin();
        setOrders(res.data);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      }
    };

    fetchOrders();
  }, []);

  const columns: TableColumn<Order>[] = [
    {
      name: "Order No",
      selector: (row) => row.id || "",
      sortable: true,
      cell: (row) => (
        <span className="text-primary fw-bold">#{row.id?.slice(0, 8)}</span>
      ),
    },
    {
      name: "Customer",
      selector: (row) => row.customerId || "",
      sortable: true,
    },
    {
      name: "Date",
      selector: (row) => row.createdAt || "",
      cell: (row) => (
        <span>{row.createdAt ? new Date(row.createdAt).toLocaleString("vi-VN") : "N/A"}</span>
      ),
    },
    {
      name: "Amount",
      selector: (row) => row.totalAmount.toString(),
      cell: (row) => <span>{row.totalAmount.toLocaleString("vi-VN")}₫</span>,
    },
    {
      name: "Status",
      selector: (row) => row.statusId || "",
      cell: (row) => <span>{row.statusId}</span>,
    },
  ];

  const handleRowClick = (row: Order) => {
    if (row.id) {
      router.push(`/dashboard/order-details/${row.id}`);
    }
  };

  const handleFilter = (e: ChangeEvent<HTMLInputElement>) => {
    setFilterText(e.target.value);
  };

  const handleRowsPerPageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const filteredItems = orders.filter(
    (item) =>
      item.customerId?.toLowerCase().includes(filterText.toLowerCase()) ||
      item.id?.toLowerCase().includes(filterText.toLowerCase()) ||
      item.statusId?.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="body-root-inner">
      <div className="transection">
        <div className="title-right-actioin-btn-wrapper-product-list">
          <h3 className="title">Tất cả đơn hàng</h3>
          <div className="button-wrapper">
            <select className="nice-select" onChange={(e) => handleFilterChange(e.target.value)}>
              <option value="All">Tất cả</option>
              <option value="Pending">Chờ xử lý</option>
              <option value="Completed">Hoàn tất</option>
              <option value="Canceled">Đã hủy</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <div className="dataTables_filter">
            <label>
              Search:
              <input
                type="search"
                value={filterText}
                onChange={handleFilter}
                placeholder="Tìm theo mã, khách hàng hoặc trạng thái"
              />
            </label>
          </div>

          <DataTable
            columns={columns}
            data={filteredItems.filter((order) => activeFilter === "All" || order.statusId === activeFilter)}
            pagination
            paginationPerPage={rowsPerPage}
            paginationRowsPerPageOptions={[5, 10, 15, 20]}
            noDataComponent="Không có đơn hàng nào."
            highlightOnHover
            pointerOnHover
            responsive
            className="table table-hover"
            onRowClicked={handleRowClick}
          />
        </div>
      </div>
    </div>
  );
};

export default OverviewTable;
