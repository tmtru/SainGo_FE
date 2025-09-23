"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { useRouter } from "next/navigation";
import OrderService, { Order, OrderFilterDto } from "@/data/Services/OrderService";
import CustomLoader from "@/components/common/CustomLoader";

interface OrderStatistics {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  averageOrderValue: number;
}

const OverviewTable: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStatuses, setOrderStatuses] = useState<{ id: string; name: string }[]>([]);
  const [filterText, setFilterText] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [statistics, setStatistics] = useState<OrderStatistics>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    averageOrderValue: 0,
  });
  const [totalRows, setTotalRows] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    fetchStatuses();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, rowsPerPage, filterText, activeFilter]);

  const fetchStatuses = async () => {
    try {
      const res = await OrderService.getOrderStatuses();
      setOrderStatuses(res.data);
    } catch (error) {
      console.error("Failed to fetch statuses", error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const filter: OrderFilterDto = {
        pageNumber: currentPage,
        pageSize: rowsPerPage,
        keyword: filterText || undefined,
        statusId: activeFilter === "All" ? undefined : activeFilter,
        sortBy: "createdAt",
        sortDesc: true,
      };

      const response = await OrderService.filterAdminOrders(filter);
      const { items, totalItems } = response.data;

      setOrders(items);
      setTotalRows(totalItems);
      calculateStatistics(items);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (ordersData: Order[]) => {
    const totalOrders = ordersData.length;
    const totalRevenue = ordersData.reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingOrders = ordersData.filter(order =>
      order.statusId === "pending" || order.statusId === "processing"
    ).length;
    const completedOrders = ordersData.filter(order =>
      order.statusId === "completed" || order.statusId === "delivered"
    ).length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    setStatistics({
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      averageOrderValue,
    });
  };

  const getStatusName = (statusId: string) => {
    const status = orderStatuses.find(s => s.id === statusId);
    return status ? status.name : statusId;
  };

  const getStatusBadgeClass = (statusId: string) => {
    switch (statusId?.toLowerCase()) {
      case 'pending':
        return 'badge bg-warning text-dark';
      case 'processing':
        return 'badge bg-info text-white';
      case 'completed':
      case 'delivered':
        return 'badge bg-success text-white';
      case 'cancelled':
      case 'canceled':
        return 'badge bg-danger text-white';
      case 'paid':
        return 'badge bg-primary text-white';
      default:
        return 'badge bg-secondary text-white';
    }
  };

  const columns: TableColumn<Order>[] = [
    {
      name: "Mã đơn hàng",
      selector: (row) => row.orderNumber || "",
      sortable: true,
      cell: (row) => (
        <span className="text-primary fw-bold">
          #{row.orderNumber}
        </span>
      ),
      width: "200px",
    },

    {
      name: "Khách hàng",
      selector: (row) => row.customerId || "",
      cell: (row) => (
        <span className="text-truncate" style={{ maxWidth: "150px" }}>
          {row.customerId?.slice(0, 8) || "N/A"}
        </span>
      ),
      width: "120px",
    },
    {
      name: "Ngày đặt",
      selector: (row) => row.createdAt || "",
      cell: (row) => (
        <span>
          {row.createdAt
            ? new Date(row.createdAt).toLocaleDateString("vi-VN")
            : "N/A"}
        </span>
      ),
      width: "120px",
    },
    {
      name: "Tổng tiền",
      selector: (row) => row.totalAmount,
      cell: (row) => (
        <span className="fw-bold text-success">
          {row.totalAmount.toLocaleString("vi-VN")}₫
        </span>
      ),
      width: "130px",
    },
    {
      name: "Trạng thái",
      selector: (row) => row.statusId || "",
      cell: (row) => (
        <span className={getStatusBadgeClass(row.statusId || "")}>
          {getStatusName(row.statusId || "")}
        </span>
      ),
      width: "120px",
    },
    {
      name: "Phương thức TT",
      selector: (row) => row.paymentMethod || "",
      cell: (row) => (
        <span className="text-muted small">
          {row.paymentMethod || "N/A"}
        </span>
      ),
      width: "120px",
    },
  ];

  const handleRowClick = (row: Order) => {
    if (row.id) {
      router.push(`/dashboard/order-details/${row.id}`);
    }
  };

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilterText(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: string) => {
    setActiveFilter(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePerRowsChange = (newPerPage: number) => {
    setRowsPerPage(newPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="body-root-inner">
      <div className="transection">
        {/* Statistic Cards */}
        <div className="row g-5">
          {[
            { label: "Tổng đơn hàng", value: statistics.totalOrders },
            { label: "Đơn hàng hoàn thành", value: statistics.completedOrders },
            { label: "Chờ xác nhận", value: statistics.pendingOrders },
          ].map((item, idx) => (
            <div key={idx} className="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12">
              <div className="single-over-fiew-card">
                <span className="top-main">{item.label}</span>
                <div className="bottom">
                  <h2 className="title">{item.value}</h2>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="title-right-actioin-btn-wrapper-product-list mt-5">
          <h3 className="title">Quản lý đơn hàng</h3>
          <div className="button-wrapper">
            <select
              className="nice-select"
              value={activeFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="All">Tất cả trạng thái</option>
              {orderStatuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="product-top-filter-area-l mb-3">
          <div className="row align-items-center">
            <div className="col-md-6">
              <label className="d-flex align-items-center">
                <span className="me-2">Tìm kiếm:</span>
                <input
                  type="search"
                  className="form-control"
                  value={filterText}
                  onChange={handleFilterChange}
                  placeholder="Mã đơn, khách hàng, trạng thái..."
                  style={{ width: "400px" }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <DataTable
            columns={columns}
            data={orders}
            progressPending={loading}
            pagination
            paginationServer
            paginationTotalRows={totalRows}
            paginationPerPage={rowsPerPage}
            onChangeRowsPerPage={handlePerRowsChange}
            onChangePage={handlePageChange}
            noDataComponent={
              <div className="text-center p-4">
                <i className="fa fa-inbox fa-3x text-muted mb-3"></i>
                <h5>Không tìm thấy đơn hàng nào</h5>
                <p className="text-muted">
                  {activeFilter !== "All" || filterText
                    ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                    : "Chưa có đơn hàng nào trong hệ thống"}
                </p>
              </div>
            }
            highlightOnHover
            pointerOnHover
            responsive
            onRowClicked={handleRowClick}
            customStyles={{
              headRow: {
                style: {
                  backgroundColor: '#f8f9fa',
                  borderBottomWidth: '2px',
                  borderBottomColor: '#dee2e6',
                },
              },
              rows: {
                style: {
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                },
              },
            }}
            paginationComponentOptions={{
              rangeSeparatorText: 'trên',
              rowsPerPageText: 'Dòng mỗi trang:',
              noRowsPerPage: false,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default OverviewTable;
