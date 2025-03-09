import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

interface PaginationProps {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  items: any[];
  maxPages: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  setPage,
  items,
  maxPages,
}) => {
  const renderPageNumbers = () => {
    const visiblePages = 3;
    const currentPage = page;

    if (maxPages < 7)
      return [...Array(maxPages - visiblePages - 1)].map((_, i) => {
        const pageNumber = i + 3;
        return (
          <button
            key={i}
            onClick={() => setPage(pageNumber)}
            className={`${
              currentPage === pageNumber ? "opacity-75" : "opacity-50"
            } text-[#F0F0F0] hover:opacity-75 transition-all cursor-pointer`}
          >
            {pageNumber}
          </button>
        );
      });

    if (currentPage <= visiblePages) {
      return [...Array(visiblePages)].map((_, i) => {
        const pageNumber = i + 3;
        return (
          <button
            key={i}
            onClick={() => setPage(pageNumber)}
            className={`${
              currentPage === pageNumber ? "opacity-75" : "opacity-50"
            } text-[#F0F0F0] hover:opacity-75 transition-all cursor-pointer`}
          >
            {pageNumber}
          </button>
        );
      });
    }

    if (currentPage >= maxPages - 2) {
      return [...Array(visiblePages)].map((_, i) => {
        const pageNumber = maxPages - 4 + i;
        return (
          <button
            key={i}
            onClick={() => setPage(pageNumber)}
            className={`${
              currentPage === pageNumber ? "opacity-75" : "opacity-50"
            } text-[#F0F0F0] hover:opacity-75 transition-all cursor-pointer`}
          >
            {pageNumber}
          </button>
        );
      });
    }

    const middlePage = Math.floor(visiblePages / 2);
    const startPage = currentPage - middlePage;
    const endPage = currentPage + middlePage;
    return [...Array(visiblePages)].map((_, i) => {
      const pageNumber = startPage + i;
      return (
        <button
          key={i}
          onClick={() => setPage(pageNumber)}
          className={`${
            currentPage === pageNumber ? "opacity-75" : "opacity-50"
          } text-[#F0F0F0] hover:opacity-75 transition-all cursor-pointer`}
        >
          {pageNumber}
        </button>
      );
    });
  };

  return (
    <div className="mt-5 flex w-full cursor-pointer items-center justify-center gap-6 font-changa">
      <button
        onClick={() => {
          if (page > 1) setPage(page - 1);
        }}
        className={`cursor-pointer text-[#F0F0F0] hover:opacity-75 ${
          page > 1 ? "" : "opacity-50 pointer-events-none"
        }`}
      >
        <FaChevronLeft className="w-3 h-3" />
      </button>
      {items && items.length > 0 && (
        <>
          <button
            onClick={() => setPage(1)}
            className={`${
              page === 1 ? "opacity-75" : "opacity-50"
            } text-[#F0F0F0] hover:opacity-75 transition-all cursor-pointer`}
          >
            1
          </button>
          {maxPages > 1 && (
            <button
              onClick={() => {
                (page === 1 || page === 2 || page === 3) && setPage(2);
              }}
              className={`${
                page === 2 ? "opacity-75" : "opacity-50"
              } text-[#F0F0F0] hover:opacity-75 transition-all cursor-pointer`}
            >
              {page === 2 || page === 1 || page === 3 ? "2" : ". . . "}
            </button>
          )}
          {maxPages > 4 && renderPageNumbers()}
          {maxPages > 3 && (
            <button
              onClick={() => {
                (page === maxPages - 2 ||
                  page === maxPages - 1 ||
                  page === maxPages) &&
                  setPage(maxPages - 1);
              }}
              className={`${
                page === maxPages - 1 ? "opacity-75" : "opacity-50"
              } text-[#F0F0F0] hover:opacity-75 transition-all cursor-pointer`}
            >
              {page === maxPages - 2 ||
              page === maxPages - 1 ||
              page === maxPages
                ? maxPages - 1
                : ". . ."}
            </button>
          )}
          {maxPages > 2 && (
            <button
              onClick={() => setPage(maxPages)}
              className={`${
                page === maxPages ? "opacity-75" : "opacity-50"
              } text-[#F0F0F0] hover:opacity-75 transition-all cursor-pointer`}
            >
              {maxPages}
            </button>
          )}
        </>
      )}
      <button
        onClick={() => {
          if (page < maxPages) setPage(page + 1);
        }}
        className={`cursor-pointer text-[#F0F0F0] hover:opacity-75 ${
          page < maxPages ? "" : "opacity-50 pointer-events-none"
        }`}
      >
        <FaChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
};
