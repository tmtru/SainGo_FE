"use client";

import React, { useState, useEffect, ChangeEvent, useRef, useCallback, useMemo } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { useRouter } from "next/navigation";
import OrderService, { AssignOrderPayload, Order, OrderFilterDto, ShipperOption } from "@/data/Services/OrderService";
import CustomLoader from "@/components/common/CustomLoader";
import { useAuth } from "@/components/Context/AuthContext";
import { toast } from "react-toastify";

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
  const [shippers, setShippers] = useState<ShipperOption[]>([]);
  const [assignmentSelections, setAssignmentSelections] = useState<Record<string, string>>({});
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const filterRef = useRef<OrderFilterDto | null>(null);

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const isAdmin = useMemo(() => user?.roleName?.toLowerCase() === "admin", [user]);

  const fetchStatuses = useCallback(async () => {
    try {
      const res = await OrderService.getOrderStatuses();
      setOrderStatuses(res.data);
    } catch (error) {
      console.error("Failed to fetch statuses", error);
    }
  }, []);

  const loadShippers = useCallback(async () => {
    try {
      const res = await OrderService.getActiveShippers();
      setShippers(res.data);
    } catch (error) {
      console.error("Failed to fetch shippers", error);
      toast.error("Không thể tải danh sách shipper");
    }
  }, []);

  const calculateStatistics = useCallback((ordersData: Order[]) => {
    const totalOrders = ordersData.length;
    const totalRevenue = ordersData.reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingOrders = ordersData.filter(
      (order) => order.statusId === "pending" || order.statusId === "processing",
    ).length;
    const completedOrders = ordersData.filter(
      (order) => order.statusId === "completed" || order.statusId === "delivered",
    ).length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    setStatistics({
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      averageOrderValue,
    });
  }, []);

  const fetchOrders = useCallback(async () => {
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

      filterRef.current = filter;

      const response = await OrderService.filterAdminOrders(filter);
      const { items, totalItems } = response.data;

      setOrders(items);
      setTotalRows(totalItems);
      calculateStatistics(items);

      const initialSelections = items.reduce((acc, order) => {
        if (order.id) {
          acc[order.id] = order.shipperId ?? "";
        }
        return acc;
      }, {} as Record<string, string>);
      setAssignmentSelections(initialSelections);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, calculateStatistics, currentPage, filterText, rowsPerPage]);

  const handleAssignmentSelectionChange = useCallback((orderId: string, shipperId: string) => {
    setAssignmentSelections((prev) => ({ ...prev, [orderId]: shipperId }));
  }, []);

  const handleAssignOrder = useCallback(
    async (orderId: string) => {
      const shipperId = assignmentSelections[orderId];
      if (!shipperId) {
        toast.warn("Vui lòng chọn shipper để giao đơn hàng.");
        return;
      }

      const targetOrder = orders.find((orderItem) => orderItem.id === orderId);
      if (targetOrder?.shipperId === shipperId) {
        toast.info("Đơn hàng đã được giao cho shipper này.");
        return;
      }

      const payload: AssignOrderPayload = {
        orderId,
        shipperId,
      };

      setAssigningOrderId(orderId);
      try {
        await OrderService.assignOrderToShipper(payload);
        toast.success("Giao đơn hàng cho shipper thành công!");
        await fetchOrders();
      } catch (error) {
        console.error("Failed to assign shipper", error);
        toast.error("Không thể giao đơn hàng cho shipper.");
      } finally {
        setAssigningOrderId(null);
      }
    },
    [assignmentSelections, fetchOrders, orders],
  );

  const handleExport = useCallback(async () => {
    try {
      setExporting(true);
      const exportFilter: OrderFilterDto = {
        ...(filterRef.current ?? {}),
        pageNumber: 1,
        pageSize: totalRows > 0 ? totalRows : rowsPerPage,
      };

      const response = await OrderService.exportOrders(exportFilter);
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `orders_${new Date().toISOString()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Xuất Excel thành công!");
    } catch (error) {
      console.error("Failed to export orders", error);
      toast.error("Không thể xuất Excel.");
    } finally {
      setExporting(false);
    }
  }, [rowsPerPage, totalRows]);

  const getStatusName = useCallback(
    (statusId: string) => {
      const status = orderStatuses.find((s) => s.id === statusId);
      return status ? status.name : statusId;
    },
    [orderStatuses],
  );

  const getStatusBadgeClass = useCallback((statusId: string) => {
    switch (statusId?.toLowerCase()) {
      case "pending":
        return "badge bg-warning text-dark";
      case "processing":
        return "badge bg-info text-white";
      case "completed":
      case "delivered":
        return "badge bg-success text-white";
      case "cancelled":
      case "canceled":
        return "badge bg-danger text-white";
      case "paid":
        return "badge bg-primary text-white";
      default:
        return "badge bg-secondary text-white";
    }
  }, []);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (isAdmin) {
      loadShippers();
    }
  }, [isAdmin, loadShippers]);

  const formatCurrency = useCallback((amount?: number) => {
    if (amount === undefined || amount === null || Number.isNaN(amount)) {
      return "0₫";
    }
    return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  }, []);

  const overviewCards = useMemo(
    () => [
      { label: "Tổng đơn hàng", value: statistics.totalOrders.toString() },
      { label: "Đơn hoàn thành", value: statistics.completedOrders.toString() },
      { label: "Chờ xử lý", value: statistics.pendingOrders.toString() },
    ],
    [formatCurrency, statistics],
  );

  const formatDateTime = useCallback((value?: string | null, includeTime: boolean = true) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return includeTime
      ? date.toLocaleString("vi-VN")
      : date.toLocaleDateString("vi-VN");
  }, []);

  const renderOrderNumberCell = useCallback(
    (row: Order) => (
      <span className="text-primary fw-bold">
        #{row.orderNumber}
      </span>
    ),
    [],
  );

  const renderCustomerCell = useCallback(
    (row: Order) => (
      <div className="d-flex flex-column" style={{ maxWidth: "220px" }}>
        <span className="fw-semibold text-dark text-truncate" title={row.customerName || row.customerId}>
          {row.customerName || row.customerId || "N/A"}
        </span>

      </div>
    ),
    [],
  );

  const renderCreatedAtCell = useCallback(
    (row: Order) => (
      <div className="d-flex flex-column">
        <span className="fw-semibold">{formatDateTime(row.createdAt, false) || "—"}</span>
        {row.createdAt && (
          <span className="text-muted small">{formatDateTime(row.createdAt)}</span>
        )}
      </div>
    ),
    [formatDateTime],
  );

  const renderTotalAmountCell = useCallback(
    (row: Order) => (
      <span className="fw-bold text-success">{formatCurrency(row.totalAmount)}</span>
    ),
    [formatCurrency],
  );

  const renderItemCountCell = useCallback(
    (row: Order) => (
      <div className="d-flex flex-column align-items-center">
        <span className="badge bg-light text-dark">{row.orderItems?.length ?? 0}</span>
        {row.discountAmount ? (
          <span className="text-muted small">-{formatCurrency(row.discountAmount)}</span>
        ) : null}
      </div>
    ),
    [formatCurrency],
  );

  const renderShipperCell = useCallback(
    (row: Order) => {
      const orderId = row.id;
      const currentSelection = orderId ? assignmentSelections[orderId] ?? row.shipperId ?? "" : "";
      const currentShipperId = row.shipperId ?? "";
      const canAssign = Boolean(orderId && currentSelection && currentSelection !== currentShipperId);

      return (
        <div className="d-flex flex-column gap-2" style={{ minWidth: "240px" }}>
          <span className="small text-muted">{row.shipperName || "Chưa phân công"}</span>
          {isAdmin && orderId && shippers.length > 0 && (
            <div className="d-flex gap-2 align-items-center">
              <select
                className="form-select form-select-sm"
                value={currentSelection}
                onChange={(e) => {
                  e.stopPropagation();
                  handleAssignmentSelectionChange(orderId, e.target.value);
                }}
              >
                <option value="">Chọn shipper</option>
                {shippers.map((shipper) => (
                  <option key={shipper.userId} value={shipper.userId}>
                    {shipper.fullName || shipper.userName || shipper.userId}
                  </option>
                ))}
              </select>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAssignOrder(orderId);
                }}
                disabled={!canAssign || assigningOrderId === orderId}
              >
                {assigningOrderId === orderId ? "Đang giao..." : "Giao"}
              </button>
            </div>
          )}
        </div>
      );
    },
    [assignmentSelections, assigningOrderId, handleAssignOrder, handleAssignmentSelectionChange, isAdmin, shippers],
  );

  const renderStatusCell = useCallback(
    (row: Order) => (
      <span className={getStatusBadgeClass(row.statusId || "")}>
        {getStatusName(row.statusId || "")}
      </span>
    ),
    [getStatusBadgeClass, getStatusName],
  );

  const getPaymentStatusBadgeClass = useCallback((status?: string | null) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "completed":
        return "badge bg-success text-white";
      case "pending":
      case "unpaid":
        return "badge bg-warning text-dark";
      case "failed":
      case "cancelled":
      case "canceled":
        return "badge bg-danger text-white";
      case "refunded":
        return "badge bg-info text-white";
      default:
        return "badge bg-secondary text-white";
    }
  }, []);

  const renderPaymentStatusCell = useCallback(
    (row: Order) => (
      <div className="d-flex flex-column">
        <span className={getPaymentStatusBadgeClass(row.paymentStatus)}>
          {(row.paymentStatus || "Không xác định").replace(/_/g, " ")}
        </span>
        {row.paidAt && (
          <span className="text-muted small">{formatDateTime(row.paidAt)}</span>
        )}
      </div>
    ),
    [formatDateTime, getPaymentStatusBadgeClass],
  );

  const renderPaymentMethodCell = useCallback(
    (row: Order) => (
      <div className="d-flex flex-column">
        <span className="text-muted small">{row.paymentMethod || "N/A"}</span>
        {row.couponCode && (
          <span className="text-success small">Mã giảm giá: {row.couponCode}</span>
        )}
      </div>
    ),
    [],
  );

  const renderScheduleCell = useCallback(
    (row: Order) => {
      if (!row.preferredDeliveryDate && !row.preferredTimeSlot && !row.requestedDeliveryTime) {
        return <span className="text-muted small">Không đặt lịch</span>;
      }

      const preferredDate = row.preferredDeliveryDate ? formatDateTime(row.preferredDeliveryDate, false) : null;

      return (
        <div className="d-flex flex-column">
          {preferredDate && <span className="fw-semibold">{preferredDate}</span>}
          {row.preferredTimeSlot && <span className="text-muted small">{row.preferredTimeSlot}</span>}
          {!preferredDate && row.requestedDeliveryTime && (
            <span className="text-muted small">{row.requestedDeliveryTime}</span>
          )}
        </div>
      );
    },
    [formatDateTime],
  );

  const columns: TableColumn<Order>[] = useMemo(
    () => [
      {
        name: "Mã đơn hàng",
        selector: (row) => row.orderNumber || "",
        sortable: true,
        cell: renderOrderNumberCell,
        width: "160px",
      },
      {
        name: "Khách hàng",
        selector: (row) => row.customerName || row.customerId || "",
        cell: renderCustomerCell,
        grow: 2,
      },
      {
        name: "Sản phẩm",
        selector: (row) => row.orderItems?.length ?? 0,
        sortable: true,
        cell: renderItemCountCell,
        width: "110px",
        center: true,
      },
      {
        name: "Ngày đặt",
        selector: (row) => row.createdAt || "",
        cell: renderCreatedAtCell,
        width: "170px",
      },
      {
        name: "Lịch giao",
        selector: (row) => row.preferredDeliveryDate || row.preferredTimeSlot || row.requestedDeliveryTime || "",
        cell: renderScheduleCell,
        width: "190px",
      },
      {
        name: "Tổng tiền",
        selector: (row) => row.totalAmount,
        cell: renderTotalAmountCell,
        width: "140px",
      },
      {
        name: "Trạng thái",
        selector: (row) => row.statusId || "",
        cell: renderStatusCell,
        width: "140px",
      },
    ],
    [
      renderCreatedAtCell,
      renderCustomerCell,
      renderItemCountCell,
      renderOrderNumberCell,
      renderPaymentMethodCell,
      renderPaymentStatusCell,
      renderScheduleCell,

    ],
  );

  const handleRowClick = useCallback(
    (row: Order) => {
      if (row.id) {
        router.push(`/dashboard/order-details/${row.id}`);
      }
    },
    [router],
  );

  const handleFilterChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFilterText(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((status: string) => {
    setActiveFilter(status);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePerRowsChange = useCallback((newPerPage: number) => {
    setRowsPerPage(newPerPage);
    setCurrentPage(1);
  }, []);

  if (authLoading) {
    return <CustomLoader />;
  }

  if (!isAdmin) {
    return (
      <div className="body-root-inner">
        <div className="transection">
          <div className="alert alert-warning">Bạn không có quyền truy cập trang này.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="body-root-inner">
      <div className="transection">
        {/* Statistic Cards */}
        <div className="row g-5">
          {overviewCards.map((item) => (
            <div key={item.label} className="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12">
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
            <button
              className="rts-btn btn-secondary"
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? "Đang xuất..." : "Xuất Excel"}
            </button>
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
