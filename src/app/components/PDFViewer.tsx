const PDFViewer = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
      <iframe
        src="/rules_room_bid.pdf" // Change this to your PDF path
        frameBorder="0"
        width="80%"
        height="90%"
        className="rounded-lg shadow-lg"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default PDFViewer;
