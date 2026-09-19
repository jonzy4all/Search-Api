import {
  Database,
  Search,
  Sparkles,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../api/api";

import RecordCard from "../components/RecordCard";
import SearchFilters from "../components/SearchFilters";
import Pagination from "../components/Pagination";
import Loader from "../components/Loader";

import { useAuth } from "../context/AuthContext";

const initialFilters = {
  search: "",
  category: "",
  tags: "",
  minPrice: "",
  maxPrice: "",
  minRating: "",
  city: "",
  country: "",
  createdFrom: "",
  createdTo: "",
  sortBy: "relevance",
  sortOrder: "desc",
  page: 1,
  limit: 9,
};

export default function HomePage() {
  const [filters, setFilters] =
    useState(initialFilters);

  const [appliedFilters, setAppliedFilters] =
    useState(initialFilters);

  const [records, setRecords] =
    useState([]);

  const [pagination, setPagination] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const { user } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    const loadRecords = async () => {
      setLoading(true);
      setError("");

      try {
        const params = {};

        Object.entries(
          appliedFilters
        ).forEach(([key, value]) => {
          if (
            value !== "" &&
            value !== undefined &&
            value !== null
          ) {
            params[key] = value;
          }
        });

        const response =
          await api.get(
            "/records",
            {
              params,
            }
          );

        setRecords(
          response.data.data || []
        );

        setPagination(
          response.data.meta
            ?.pagination
        );
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Unable to load records."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, [appliedFilters]);

  const handleSearch = (event) => {
    event.preventDefault();

    setAppliedFilters({
      ...filters,
      page: 1,
    });
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setAppliedFilters(
      initialFilters
    );
  };

  const handlePageChange = (
    page
  ) => {
    setAppliedFilters(
      (current) => ({
        ...current,
        page,
      })
    );

    window.scrollTo({
      top: 300,
      behavior: "smooth",
    });
  };

  const handleSave = async (
    record
  ) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const response =
        await api.post(
          `/favorites/${record.slug}`
        );

      window.alert(
        response.data.message
      );
    } catch (err) {
      window.alert(
        err.response?.data
          ?.message ||
          "Unable to save favorite."
      );
    }
  };

  return (
    <>
      <section className="hero">
        <div className="hero-glow" />

        <div className="container hero-content">
          <div className="hero-badge">
            <Sparkles size={15} />
            Intelligent record discovery
          </div>

          <h1>
            Find the right record.
            <span>
              {" "}
              Fast, filtered and
              organized.
            </span>
          </h1>

          <p>
            Search published records,
            narrow results with powerful
            filters, sort them your way
            and save the ones that
            matter.
          </p>

          <div className="hero-stats">
            <div>
              <Database size={20} />

              <span>
                <strong>
                  {pagination
                    ?.totalRecords ??
                    "—"}
                </strong>
                available records
              </span>
            </div>

            <div>
              <Search size={20} />

              <span>
                Public search with no
                login required
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="container content-layout">
        <SearchFilters
          filters={filters}
          setFilters={setFilters}
          onSubmit={handleSearch}
          onReset={handleReset}
        />

        <section className="results-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                DISCOVER
              </span>

              <h2>
                Search results
              </h2>
            </div>

            {pagination && (
              <span className="result-count">
                {
                  pagination.totalRecords
                }{" "}
                records
              </span>
            )}
          </div>

          {loading ? (
            <Loader />
          ) : error ? (
            <div className="alert error">
              {error}
            </div>
          ) : records.length === 0 ? (
            <div className="empty-state">
              <Search size={34} />

              <h3>
                No records found
              </h3>

              <p>
                Try changing your search
                or filters.
              </p>
            </div>
          ) : (
            <>
              <div className="record-grid">
                {records.map(
                  (record) => (
                    <RecordCard
                      key={record._id}
                      record={record}
                      onSave={
                        handleSave
                      }
                    />
                  )
                )}
              </div>

              <Pagination
                pagination={
                  pagination
                }
                onPageChange={
                  handlePageChange
                }
              />
            </>
          )}
        </section>
      </div>
    </>
  );
}