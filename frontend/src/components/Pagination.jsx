import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Pagination({
  pagination,
  onPageChange,
}) {
  if (
    !pagination ||
    pagination.totalPages <= 1
  ) {
    return null;
  }

  return (
    <div className="pagination">
      <button
        className="button secondary"
        disabled={
          !pagination.hasPreviousPage
        }
        onClick={() =>
          onPageChange(
            pagination.currentPage - 1
          )
        }
      >
        <ChevronLeft size={17} />
        Previous
      </button>

      <span>
        Page{" "}
        <strong>
          {pagination.currentPage}
        </strong>{" "}
        of{" "}
        <strong>
          {pagination.totalPages}
        </strong>
      </span>

      <button
        className="button secondary"
        disabled={
          !pagination.hasNextPage
        }
        onClick={() =>
          onPageChange(
            pagination.currentPage + 1
          )
        }
      >
        Next
        <ChevronRight size={17} />
      </button>
    </div>
  );
}