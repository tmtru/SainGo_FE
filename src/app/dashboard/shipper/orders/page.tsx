"use client";

import { useState } from "react";
import SideLeft from "../../components/SideLeft";
import Header from "../../components/Header";
import AssignedOrdersContent from "@/app/dashboard/shipper/orders/AssignedOrdersContent";

export default function ShipperOrdersPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    return (
        <div className="ekomart_dashboard">
            <SideLeft collapsed={sidebarCollapsed} />
            <div className={`right-area-body-content ${sidebarCollapsed ? "collapsed" : ""}`}>
                <Header onToggleSidebar={toggleSidebar} />
                <AssignedOrdersContent />
            </div>
        </div>
    );
}
