import {
  Edit,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import api from "../../api/api";
import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";

const initialFilters = {
  search: "",
  status: "",
  category: "",
  page: 1,
  limit: 10,
  sortBy: "createdAt",
  sortOrder: "desc",
};

export default function AdminDashboard() {
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {};

      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value !== "" && value !== undefined && value !== null) {
          params[key] = value;
        }
      });

      const response = await api.get("/admin/records", { params });

      setRecords(response.data.data || []);
      setPagination(response.data.meta?.pagination || null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load admin records."
      );
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const searchRecords = (event) => {
    event.preventDefault();

    setAppliedFilters({
      ...filters,
      page: 1,
    });

    setFilters((current) => ({
      ...current,
      page: 1,
    }));
  };

  const handlePageChange = (page) => {
    setFilters((current) => ({
      ...current,
      page,
    }));

    setAppliedFilters((current) => ({
      ...current,
      page,
    }));
  };

  const deleteRecord = async (record) => {
    const confirmed = window.confirm(
      `Delete "${record.title}"?`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/admin/records/${record.slug}`);
      await loadRecords();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete record."
      );
    }
  };

  return (
    <div className="container page-section">
      <div className="page-heading admin-heading">
        <div>
          <span className="eyebrow">ADMINISTRATION</span>
          <h1>Records dashboard</h1>
          <p>
            Create, update, publish, archive and remove records.
          </p>
        </div>

        <Link
          to="/admin/records/new"
          className="button primary"
        >
          <Plus size={17} />
          New record
        </Link>
      </div>

      <form
        className="admin-filters"
        onSubmit={searchRecords}
      >
        <div className="search-field">
          <Search size={18} />
          <input
            placeholder="Search records..."
            value={filters.search}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                search: event.target.value,
              }))
            }
          />
        </div>

        <select
          value={filters.status}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              status: event.target.value,
            }))
          }
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>

        <select
          value={filters.category}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              category: event.target.value,
            }))
          }
        >
          <option value="">All categories</option>
          <option value="technology">Technology</option>
          <option value="education">Education</option>
          <option value="health">Health</option>
          <option value="finance">Finance</option>
          <option value="travel">Travel</option>
          <option value="business">Business</option>
          <option value="entertainment">Entertainment</option>
          <option value="other">Other</option>
        </select>

        <button className="button primary" type="submit">
          Search
        </button>
      </form>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <Loader />
      ) : records.length === 0 ? (
        <div className="empty-state">
          <Search size={34} />
          <h3>No records found</h3>
          <p>Try another search or filter.</p>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Rating</th>
                  <th>Price</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record) => (
                  <tr key={record._id}>
                    <td><strong>{record.title}</strong></td>
                    <td>{record.category}</td>
                    <td>
                      <span className={`status ${record.status}`}>
                        {record.status}
                      </span>
                    </td>
                    <td>{record.rating}</td>
                    <td>
                      {Number(record.price || 0).toLocaleString()}
                    </td>
                    <td>
                      {new Date(record.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link
                          to={`/admin/records/${record.slug}/edit`}
                          className="icon-button"
                          title="Edit record"
                        >
                          <Edit size={17} />
                        </Link>

                        <button
                          type="button"
                          className="icon-button danger"
                          onClick={() => deleteRecord(record)}
                          title="Delete record"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
