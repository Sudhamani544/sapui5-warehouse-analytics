sap.ui.define([], function () {
    "use strict";

    return {
        /**
         * Processes raw OData results into grouped chart data
         */
        parseChartData: function (aResults, mShipperNames) {
            var aMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            
            // 1. Logic for Chart 1 (Average Processing Days)
            var oMonthlyData = aResults.reduce(function (acc, oOrder) {
                if (oOrder.OrderDate && oOrder.ShippedDate) {
                    var sMonth = new Date(oOrder.OrderDate).toLocaleString('default', { month: 'short' });
                    var iDiffDays = Math.ceil(Math.abs(new Date(oOrder.ShippedDate) - new Date(oOrder.OrderDate)) / (1000 * 60 * 60 * 24));
                    
                    if (!acc[sMonth]) acc[sMonth] = { sum: 0, count: 0 };
                    acc[sMonth].sum += iDiffDays;
                    acc[sMonth].count++;
                }
                return acc;
            }, {});

            var aChart1 = Object.keys(oMonthlyData).map(function (key) {
                return { Month: key, AvgDays: parseFloat((oMonthlyData[key].sum / oMonthlyData[key].count).toFixed(2)) };
            }).sort((a, b) => aMonths.indexOf(a.Month) - aMonths.indexOf(b.Month));

            // 2. Logic for Chart 2 (Shipper Stats)
            var oShipperData = aResults.reduce(function (acc, oOrder) {
                if (oOrder.OrderDate && oOrder.ShippedDate) {
                    var sMonth = new Date(oOrder.OrderDate).toLocaleString('default', { month: 'short' });
                    var sShipper = mShipperNames[oOrder.ShipVia] || "Unknown";
                    var sKey = sMonth + "_" + sShipper;
                    var iDiff = Math.ceil(Math.abs(new Date(oOrder.ShippedDate) - new Date(oOrder.RequiredDate)) / (1000 * 60 * 60 * 24));

                    if (!acc[sKey]) acc[sKey] = { Month: sMonth, Shipper: sShipper, sum: 0, count: 0 };
                    acc[sKey].sum += iDiff;
                    acc[sKey].count++;
                }
                return acc;
            }, {});

            var aChart2 = Object.keys(oShipperData).map(function (key) {
                var oItem = oShipperData[key];
                return {
                    Month: oItem.Month,
                    Shipper: oItem.Shipper,
                    AvgDays: parseFloat((oItem.sum / oItem.count).toFixed(2)),
                    OrderCount: oItem.count
                };
            }).sort((a, b) => aMonths.indexOf(a.Month) - aMonths.indexOf(b.Month));

            return { chart1: aChart1, chart2: aChart2 };
        }
    };
});