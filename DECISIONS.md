Approach to Shipper Performance
 - I couldn't find actual delivery date in the Orders collection. So, I considered Required Date as the   delivery date and did calculation based upon that to get the shipper performance.
 - A Shipper can only have 1 order and performance is high and other shipper can have high orders and still on medium performance. In order to show that difference between Average days and Order Count I have used Viz Chart with type combination (which allows bar and line chart). And also OrderCount helps to find which season is peak for Orders. 
 - I was facing challenge to show both bar and line chart for Shipper Performance and AI was looping me through the issue which is not helping. So I have to dig into UI5 demo kit https://sapui5.netweaver.ondemand.com/#/entity/sap.viz.ui5.controls.VizFrame/sample/sap.viz.sample.CombinedColumnLine documentation for combination chart.
 - Combination chart is giving different bar and line chart colors for same shipper AvgDays and OrderCount, this was also one of the challenge to get the same color for shipper with AvgDays and OrderCount.
 - I felt that showing over all data in the form of Chart is not enough because based on destination countries the performance of Shipper might vary. So, I have added a dropdown to filter based on countries. All those countries are not hard coded. They are consumed through oData service.

What would you do differently with more time?
 - Right now entire oData service is loading on the client side which is consuming some time/memory to load the webpage. If I have more time I would look for more options to load the data inorder to scale more no:of records without consuming client memory.
 - Add search functionaly to search for countries from the dropdown.
 - Add radio button to enable or disable OrderCount line chart from Shipper Performance chart.
 - This is not with more time, but regarding to clarity on actual delivery date. I would collaborate with the backend team or the team who has provided oData service to understand better about actual delivery date.
