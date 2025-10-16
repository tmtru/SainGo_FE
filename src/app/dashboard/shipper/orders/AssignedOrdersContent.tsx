"use client";

import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import OrderService, { ChangeOrderStatus, Order, OrderFilterDto } from "@/data/Services/OrderService";
import CustomLoader from "@/components/common/CustomLoader";
import { useAuth } from "@/components/Context/AuthContext";

const SHIPPER_RESTRICTED_STATUSES = ["pending", "cancelled", "expired"];

const AssignedOrdersContent: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [orderStatuses, setOrderStatuses] = useState<{ id: string; name: string }[]>([]);
    const [statusSelections, setStatusSelections] = useState<Record<string, string>>({});
    const [filterText, setFilterText] = useState("");
    const [activeFilter, setActiveFilter] = useState<string>("All");
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalRows, setTotalRows] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const allowedStatuses = useMemo(
        () =>
            orderStatuses.filter(
                (status) => !SHIPPER_RESTRICTED_STATUSES.includes(status.id.toLowerCase()),
            ),
        [orderStatuses],
    );

    const fetchOrders = useCallback(async () => {
        if (user?.roleName?.toLowerCase() !== "shipper") {
            setOrders([]);
            setTotalRows(0);
            setLoading(false);
            return;
        }

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

            const response = await OrderService.filterShipperOrders(filter);
            const { items, totalItems } = response.data;

            setOrders(items);
            setTotalRows(totalItems);

            const initialSelections = items.reduce((acc, order) => {
                if (order.id) {
                    acc[order.id] = order.statusId ?? "";
                }
                return acc;
            }, {} as Record<string, string>);

            setStatusSelections(initialSelections);
        } catch (error) {
            console.error("Failed to load shipper orders", error);
            toast.error("Không thể tải danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    }, [activeFilter, currentPage, filterText, rowsPerPage, user]);

    const loadStatuses = useCallback(async () => {
        try {
            const res = await OrderService.getOrderStatuses();
            setOrderStatuses(res.data);
        } catch (error) {
            console.error("Failed to load statuses", error);
            toast.error("Không thể lấy danh sách trạng thái đơn hàng");
        }
    }, []);

    useEffect(() => {
        loadStatuses();
    }, [loadStatuses]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);
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
            case "shipping":
                return "badge bg-info text-white";
            case "completed":
            case "delivered":
                return "badge bg-success text-white";
            case "cancelled":
            case "canceled":
            case "expired":
                return "badge bg-danger text-white";
            default:
                return "badge bg-secondary text-white";
        }
    }, []);

    const handleStatusSelectionChange = useCallback((orderId: string, value: string) => {
        setStatusSelections((prev) => ({ ...prev, [orderId]: value }));
    }, []);

    const handleUpdateStatus = useCallback(
        async (orderId: string) => {
            const selectedStatus = statusSelections[orderId];
            const currentOrder = orders.find((order) => order.id === orderId);

            if (!selectedStatus) {
                toast.warn("Vui lòng chọn trạng thái hợp lệ.");
                return;
            }

            if (currentOrder?.statusId === selectedStatus) {
                toast.info("Trạng thái đơn hàng không thay đổi.");
                return;
            }

            const payload: ChangeOrderStatus = {
                orderId,
                statusId: selectedStatus,
            };

            setUpdatingOrderId(orderId);
            try {
                await OrderService.updateOrderStatusAsShipper(payload);
                toast.success("Cập nhật trạng thái đơn hàng thành công!");
                await fetchOrders();
            } catch (error) {
                console.error("Failed to update order status", error);
                toast.error("Không thể cập nhật trạng thái đơn hàng.");
            } finally {
                setUpdatingOrderId(null);
            }
        },
        [fetchOrders, orders, statusSelections],
    );

    const renderOrderNumberCell = useCallback(
        (row: Order) => <span className="text-primary fw-semibold">#{row.orderNumber}</span>,
        [],
    );

    const renderCreatedAtCell = useCallback(
        (row: Order) => (
            <span>{row.createdAt ? new Date(row.createdAt).toLocaleString("vi-VN") : "N/A"}</span>
        ),
        [],
    );

    const renderTotalAmountCell = useCallback(
        (row: Order) => (
            <span className="fw-bold text-success">{row.totalAmount.toLocaleString("vi-VN")}₫</span>
        ),
        [],
    );

    const renderStatusCell = useCallback(
        (row: Order) => {
            const orderId = row.id;
            const currentSelection = orderId ? statusSelections[orderId] ?? row.statusId ?? "" : "";
            const canUpdate = Boolean(orderId && currentSelection && currentSelection !== row.statusId);

            return (
                <div className="d-flex flex-column gap-2" style={{ minWidth: "220px" }}>
                    <span className={getStatusBadgeClass(row.statusId || "")}>
                        {getStatusName(row.statusId || "")}
                    </span>
                    {orderId && (
                        <div className="d-flex gap-2 align-items-center">
                            <select
                                className="form-select form-select-sm"
                                value={currentSelection}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    handleStatusSelectionChange(orderId, e.target.value);
                                }}
                            >
                                <option value="">Chọn trạng thái</option>
                                {allowedStatuses.map((status) => (
                                    <option key={status.id} value={status.id}>
                                        {status.name}
                                    </option>
                                ))}
                            </select>
                            <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (orderId) handleUpdateStatus(orderId);
                                }}
                                disabled={!canUpdate || updatingOrderId === orderId}
                            >
                                {updatingOrderId === orderId ? "Đang cập nhật..." : "Cập nhật"}
                            </button>
                        </div>
                    )}
                </div>
            );
        },
        [allowedStatuses, getStatusBadgeClass, getStatusName, handleStatusSelectionChange, handleUpdateStatus, statusSelections, updatingOrderId],
    );

    const columns: TableColumn<Order>[] = useMemo(
        () => [
            {
                name: "Mã đơn",
                selector: (row) => row.orderNumber || "",
                cell: renderOrderNumberCell,
                width: "160px",
            },
            {
                name: "Ngày đặt",
                selector: (row) => row.createdAt || "",
                cell: renderCreatedAtCell,
                width: "170px",
            },
            {
                name: "Tổng tiền",
                selector: (row) => row.totalAmount,
                cell: renderTotalAmountCell,
                width: "150px",
            },
            {
                name: "Trạng thái",
                selector: (row) => row.statusId || "",
                cell: renderStatusCell,
                width: "260px",
            },
        ],
        [renderCreatedAtCell, renderOrderNumberCell, renderStatusCell, renderTotalAmountCell],
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

    const handleStatusFilterChange = useCallback((status: string) => {
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

    if (authLoading || loading) {
        return <CustomLoader />;
    }

    if (user?.roleName?.toLowerCase() !== "shipper") {
        return (
            <div className="body-root-inner">
                <div className="transection">
                    <div className="alert alert-warning">Chỉ shipper mới có thể truy cập trang này.</div>
                </div>
            </div>
        );
    }

    return (
        <div className="body-root-inner">
            <div className="transection">
                <div className="title-right-actioin-btn-wrapper-product-list">
                    <h3 className="title">Đơn hàng được giao</h3>
                    <div className="button-wrapper">
                        <select
                            className="nice-select"
                            value={activeFilter}
                            onChange={(e) => handleStatusFilterChange(e.target.value)}
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
                                    placeholder="Mã đơn, trạng thái..."
                                    style={{ width: "320px" }}
                                />
                            </label>
                        </div>
                    </div>
                </div>

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
                                <h5>Không có đơn hàng nào</h5>
                                <p className="text-muted">Hiện bạn chưa được giao đơn hàng nào.</p>
                            </div>
                        }
                        highlightOnHover
                        pointerOnHover
                        responsive
                        onRowClicked={handleRowClick}
                        customStyles={{
                            headRow: {
                                style: {
                                    backgroundColor: "#f8f9fa",
                                    borderBottomWidth: "2px",
                                    borderBottomColor: "#dee2e6",
                                },
                            },
                            rows: {
                                style: {
                                    cursor: "pointer",
                                    "&:hover": {
                                        backgroundColor: "#f5f5f5",
                                    },
                                },
                            },
                        }}
                        paginationComponentOptions={{
                            rangeSeparatorText: "trên",
                            rowsPerPageText: "Dòng mỗi trang:",
                            noRowsPerPage: false,
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default AssignedOrdersContent;
