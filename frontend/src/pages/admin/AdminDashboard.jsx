import {
  Edit,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import api from "../../api/api";

import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";

export default function AdminDashboard() {
  const [records, setRecords] =
    useState([]);

  const [pagination, setPagination] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [filters, setFilters] =
    useState({
      search: "",
      status: "",
      category: "",
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

  const loadRecords = async () => {
    setLoading(true);

    try {
      const params = {};

      Object.entries(
        filters
      ).forEach(([key, value]) => {
        if (value !== "") {
          params[key] = value;
        }
      });

      const response =
        await api.get(
          "/admin/records",
          { params }
        );

      setRecords(
        response.data.data || []
      );

      setPagination(
        response.data.meta
          ?.pagination
      );
    } catch (err) {
      window.alert(
        err.response?.data
          ?.message ||
          "Unable to load admin records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [filters.page]);

  const searchRecords = (
    event
  ) => {
    event.preventDefault();

    setFilters((current) => ({
      ...current,
      page: 1,
    }));

    setTimeout(loadRecords, 0);
  };

  const deleteRecord = async (
    record
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${record.title}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/admin/records/${record.slug}`
      );

      loadRecords();
    } catch (err) {
      window.alert(
        err.response?.data
          ?.message ||
          "Unable to delete record."
      );
    }
  };

  return (
    <div className="container page-section">
      <div className="page-heading admin-heading">
        <div>
          <span className="eyebrow">
            ADMINISTRATION
          </span>

          <h1>
            Records dashboard
          </h1>

          <p>
            Create, update, publish,
            archive and remove records.
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
            value={
              filters.search
            }
            onChange={(event) =>
              setFilters({
                ...filters,
                search:
                  event.target.value,
              })
            }
          />
        </div>

        <select
          value={filters.status}
          onChange={(event) =>
            setFilters({
              ...filters,
              status:
                event.target.value,
            })
          }
        >
          <option value="">
            All statuses
          </option>

          <option value="draft">
            Draft
          </option>

          <option value="published">
            Published
          </option>

          <option value="archived">
            Archived
          </option>
        </select>

        <select
          value={
            filters.category
          }
          onChange={(event) =>
            setFilters({
              ...filters,
              category:
                event.target.value,
            })
          }
        >
          <option value="">
            All categories
          </option>

          <option value="technology">
            Technology
          </option>

          <option value="education">
            Education
          </option>

          <option value="health">
            Health
          </option>

          <option value="finance">
            Finance
          </option>

          <option value="travel">
            Travel
          </option>

          <option value="business">
            Business
          </option>

          <option value="entertainment">
            Entertainment
          </option>

          <option value="other">
            Other
          </option>
        </select>

        <button className="button primary">
          Search
        </button>
      </form>

      {loading ? (
        <Loader />
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
                {records.map(
                  (record) => (
                    <tr
                      key={record._id}
                    >
                      <td>
                        <strong>
                          {
                            record.title
                          }
                        </strong>
                      </td>

                      <td>
                        {
                          record.category
                        }
                      </td>

                      <td>
                        <span
                          className={`status ${record.status}`}
                        >
                          {
                            record.status
                          }
                        </span>
                      </td>

                      <td>
                        {
                          record.rating
                        }
                      </td>

                      <td>
                        {Number(
                          record.price
                        ).toLocaleString()}
                      </td>

                      <td>
                        {new Date(
                          record.createdAt
                        ).toLocaleDateString()}
                      </td>

                      <td>
                        <div className="table-actions">
                          <Link
                            to={`/admin/records/${record.slug}/edit`}
                            className="icon-button"
                          >
                            <Edit
                              size={
                                17
                              }
                            />
                          </Link>

                          <button
                            className="icon-button danger"
                            onClick={() =>
                              deleteRecord(
                                record
                              )
                            }
                          >
                            <Trash2
                              size={
                                17
                              }
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            pagination={pagination}
            onPageChange={(
              page
            ) =>
              setFilters(
                (current) => ({
                  ...current,
                  page,
                })
              )
            }
          />
        </>
      )}
    </div>
  );
}