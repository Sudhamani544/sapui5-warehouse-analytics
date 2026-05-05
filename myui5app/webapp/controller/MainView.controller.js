sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/viz/ui5/data/FlattenedDataset",
    "sap/viz/ui5/controls/common/feeds/FeedItem",
    "sap/ui/model/json/JSONModel",
    "myui5app/model/formatter"
], function (Controller, FlattenedDataset, FeedItem, JSONModel, formatter) {
    "use strict";

    return Controller.extend("myui5app.controller.MainView", {
        
        formatter: formatter,
        _aMasterData: [],
        _mShipperNames: {},

        /**
         * Lifecycle: Initialize the view and trigger data loading
         */
        onInit: function () {
            var oView = this.getView();
            oView.byId("chartHolder").setBusy(true);
            var oModel = this.getOwnerComponent().getModel();

            // 1. Setup Promise to fetch Shippers
            var pShippers = new Promise(function (resolve, reject) {
                oModel.read("/Shippers", {
                    success: function (oData) {
                        var mLookup = {};
                        oData.results.forEach(function (s) {
                            mLookup[s.ShipperID] = s.CompanyName;
                        });
                        resolve(mLookup);
                    },
                    error: function (err) { reject(err); }
                });
            });

            // 2. Get Order count then fetch in batches
            oModel.read("/Orders/$count", {
                success: function (sCount) {
                    var iTotal = parseInt(sCount);
                    var iBatchSize = 200;
                    var aPromises = [pShippers];

                    for (var i = 0; i < iTotal; i += iBatchSize) {
                        aPromises.push(this._fetchBatch(i, iBatchSize));
                    }

                    Promise.all(aPromises).then(function (aResults) {
                        // Separate Shippers from Order batches
                        this._mShipperNames = aResults.shift();
                        this._aMasterData = [].concat.apply([], aResults);

                        this._setupCountryModel(this._aMasterData);
                        this._processFinalData(this._aMasterData);

                        oView.byId("chartHolder").setBusy(false);
                        // Start with no selection to encourage user interaction
                        oView.byId("metricGroup").setSelectedIndex(-1); 
                    }.bind(this)).catch(function(err) {
                        oView.byId("chartHolder").setBusy(false);
                        console.error("Batch load failed", err);
                        sap.m.MessageBox.error("Failed to load data")
                    });
                }.bind(this)
            });
        },

        /**
         * Helper: Fetch a single batch of orders
         */
        _fetchBatch: function (iSkip, iTop) {
            var oModel = this.getOwnerComponent().getModel();
            return new Promise(function (resolve, reject) {
                oModel.read("/Orders", {
                    urlParameters: {
                        "$top": iTop,
                        "$skip": iSkip,
                        "$select": "OrderDate,ShippedDate,RequiredDate,ShipVia,ShipCountry"
                    },
                    success: function (oData) { resolve(oData.results); },
                    error: function (oErr) { reject(oErr); }
                });
            });
        },

        /**
         * UI Setup: Populate the Country Filter
         */
        _setupCountryModel: function (aData) {
            var aUniqueCountries = [...new Set(aData.map(item => item.ShipCountry))].filter(Boolean).sort();
            var aCountryEntries = [{ key: "ALL", text: "All Countries" }];
            
            aUniqueCountries.forEach(sCountry => {
                aCountryEntries.push({ key: sCountry, text: sCountry });
            });

            this.getView().setModel(new JSONModel(aCountryEntries), "countryModel");
            
            var oSelector = this.getView().byId("countrySelector");
            if (oSelector) { oSelector.setSelectedKey("ALL"); }
        },

        /**
         * Event Handler: Filter data when country changes
         */
        onCountryChange: function (oEvent) {
            var sSelectedCountry = oEvent.getParameter("selectedItem").getKey();
            var aFilteredData = (sSelectedCountry === "ALL") ? 
                this._aMasterData : 
                this._aMasterData.filter(item => item.ShipCountry === sSelectedCountry);

            this._processFinalData(aFilteredData);
        },

        /**
         * Data Processing: Use formatter to group data and bind to models
         */
        _processFinalData: function (aResults) {
            var oProcessedData = this.formatter.parseChartData(aResults, this._mShipperNames);

            this.getView().setModel(new JSONModel(oProcessedData.chart1), "chart1Model");
            this.getView().setModel(new JSONModel(oProcessedData.chart2), "chart2Model");

            this._setupChart1();
            this._setupChart2();
        },

        /**
         * Chart 1 Rendering (Line Chart)
         */
        _setupChart1: function () {
            var oChart = this.getView().byId("chartContainer1");
            oChart.setModel(this.getView().getModel("chart1Model"));
            oChart.setDataset(new FlattenedDataset({
                dimensions: [{ name: "Month", value: "{Month}" }],
                measures: [{ name: "AvgDays", value: "{AvgDays}" }],
                data: { path: "/" }
            }));
            oChart.removeAllFeeds();
            oChart.addFeed(new FeedItem({ uid: "categoryAxis", type: "Dimension", values: ["Month"] }));
            oChart.addFeed(new FeedItem({ uid: "valueAxis", type: "Measure", values: ["AvgDays"] }));
            oChart.setVizProperties({ title: { visible: false } });
        },

        /**
         * Chart 2 Rendering (Combination Chart with Dynamic Colors)
         */
        _setupChart2: function () {
            var oChart = this.getView().byId("chartContainer2");
            var aPalette = ["#19A979", "#5899DA", "#E8743B", "#945ECF", "#13A4B4"];
            
            var aRules = Object.keys(this._mShipperNames).map(function(sId, i) {
                var sName = this._mShipperNames[sId];
                return {
                    "dataContext": { "Shipper": sName },
                    "properties": { "color": aPalette[i] || "#ccc" },
                    "displayName": sName
                };
            }.bind(this));

            oChart.setModel(this.getView().getModel("chart2Model"));
            oChart.setDataset(new FlattenedDataset({
                dimensions: [
                    { name: "Month", value: "{Month}" },
                    { name: "Shipper", value: "{Shipper}" }
                ],
                measures: [
                    { name: "AvgDays", value: "{AvgDays}" }, 
                    { name: "OrderCount", value: "{OrderCount}" }
                ],
                data: { path: "/" }
            }));

            oChart.removeAllFeeds();
            oChart.addFeed(new FeedItem({ uid: "valueAxis", type: "Measure", values: ["AvgDays", "OrderCount"] }));
            oChart.addFeed(new FeedItem({ uid: "categoryAxis", type: "Dimension", values: ["Month"] }));
            oChart.addFeed(new FeedItem({ uid: "color", type: "Dimension", values: ["Shipper"] }));

            oChart.setVizProperties({
                interaction: {
                    behaviorType: "allowInteraction",
                    enableZoom: true,
                    zoomByAndPan: true
                },
                plotArea: {
                    dataShape: { primaryAxis: ["bar", "line"] },
                    dataPointStyle: { "rules": aRules },
                    line: { marker: { visible: true }, width: 2 },
                },
                valueAxis: { title: { text: "AvgDeliveryDays (Bar) & OrderVolume (Line)" } },
                title: { visible: false }
            });
        },

        /**
         * Event Handler: Toggle between Charts
         */
        onMetricSelect: function (oEvent) {
            var iSelectedIndex = oEvent.getSource().getSelectedIndex();
            var oView = this.getView();
            
            oView.byId("section1").setVisible(iSelectedIndex === 0);
            oView.byId("section2").setVisible(iSelectedIndex === 1);
            var oVizFrame = this.getView().byId("chartContainer1");
            // This tells the chart to listen for window resize/orientation events
            sap.ui.core.ResizeHandler.register(oVizFrame, function () {
                oVizFrame.invalidate();
            });
            // Redraw to fix potential zero-width issues
            var sTargetId = (iSelectedIndex === 0) ? "chartContainer1" : "chartContainer2";
            setTimeout(function() { 
                oView.byId(sTargetId).invalidate(); 
            }, 100);
        }
    });
});