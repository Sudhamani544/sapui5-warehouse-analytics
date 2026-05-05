Approach to Shipper Performance:
    - Assuming Required Date as delivery date
        I couldn't find actual delivery date in the Orders collection. I thought about adding a standard 'transit time' to the Shipped Date to estimate delivery date but it would not differentiate the performance of the different shippers. To keep project moving, I decided to use Required Date as the delivery date and did calculation based upon that to get the shipper performance. In a real world scenario, I would collaborate/communicate with the functional team/backend developer to get the proper delivery stamp.
    - Why a Combination Chart?
        A Shipper with 1 order might have high performance and while other handling 100's of orders might have sligtly lower or average performance due to the volume of orders. To show the relation between Average Delivery Time and Order Volume, I have used Viz Chart with type combination (which allows bar and line chart). And also Order Volume helps to find which season is peak for Orders. 
    - Overcoming the VizFrame Learning Curve
        I was facing challenge to show both bar and line chart for Shipper Performance and AI was looping me through the issue which is not helping. So I have to dig into UI5 demo kit documentation for combination chart. And also resolving a color-syncing issue where the bars and lines for the same shipper weren't matching
    - Adding Context with Country Filtering
        I felt that showing over all data in the form of Chart is not enough because based on destination countries the average delivery days might vary. So, I have added a destination country filter and the dropdown is populated directly from the OData service rather than being hard-coded.

What would you do differently with more time?
 - Right now, the app pulls a lot of data to the frontend for processing. To make this scalable for large volume of records, I’d look into moving the aggregation logic to the backend or using more advanced OData filtering to reduce the memory footprint.
 - Add search functionaly to search for countries from the dropdown.
 - Add radio button or checkbox to enable or disable OrderVolume line for Shipper Performance chart, making the chart less cluttered for people who only want to see delivery speed.
 - If I had more time, I would have deployed the application to SAP BTP and converted it into a fiori app.