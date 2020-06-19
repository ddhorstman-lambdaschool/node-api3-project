const server = require("./server");

require("dotenv").config();

const PORT = process.env.PORT || 5000;
const LOCATION = process.env.LOCATION || "unknown";

server.listen(PORT, () => {
  console.log(`Server hosted on ${LOCATION}`);
  console.log(`Listening on port ${PORT}`);
});
