// $(document).ready(function() {

//   function handleSearch() {
//     console.log("search button clicked");
//     var query = $("#search-query").val();
//     console.log(query);
//     if (!query || !query.trim()) {
//       return;
//     }
//     // eslint-disable-next-line default-case
//     switch ($("input[name='search-type']:checked").val()) {
//     case "author":
//       window.location.href = `/books/author/search/${query}`;
//       break;
//     case "title":
//       window.location.href = `/books/title/search/${query}`;
//       break;
//     }
//   }
//   $("#srch-btn").on("click", function(event) {
//     event.preventDefault();
//     handleSearch();
//   });
//   $("#search-query").on("keyup", function(event) {
//     if (event.which === 13) {
//       handleSearch();
//     }
//   });
// });