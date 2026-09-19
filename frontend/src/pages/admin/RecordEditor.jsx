import {
  ArrowLeft,
  Save,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../../api/api";

import Loader from "../../components/Loader";

const emptyForm = {
  title: "",
  description: "",
  category: "technology",
  tags: "",
  status: "draft",
  price: 0,
  rating: 0,
  city: "",
  country: "",
};

export default function RecordEditor() {
  const { identifier } =
    useParams();

  const editing =
    Boolean(identifier);

  const [form, setForm] =
    useState(emptyForm);

  const [loading, setLoading] =
    useState(editing);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (!editing) return;

    const loadRecord = async () => {
      try {
        const response =
          await api.get(
            `/admin/records/${identifier}`
          );

        const record =
          response.data.data;

        setForm({
          title:
            record.title || "",

          description:
            record.description || "",

          category:
            record.category ||
            "technology",

          tags:
            record.tags?.join(
              ", "
            ) || "",

          status:
            record.status ||
            "draft",

          price:
            record.price || 0,

          rating:
            record.rating || 0,

          city:
            record.location?.city ||
            "",

          country:
            record.location
              ?.country || "",
        });
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Unable to load record."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRecord();
  }, [editing, identifier]);

  const updateField = (
    event
  ) => {
    setForm({
      ...form,
      [event.target.name]:
        event.target.value,
    });
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setSaving(true);
    setError("");

    const location = {};

    if (form.city.trim()) {
      location.city =
        form.city.trim();
    }

    if (form.country.trim()) {
      location.country =
        form.country.trim();
    }

    const payload = {
      title: form.title.trim(),

      description:
        form.description.trim(),

      category: form.category,

      tags: form.tags
        .split(",")
        .map((tag) =>
          tag.trim()
        )
        .filter(Boolean),

      status: form.status,

      price: Number(
        form.price
      ),

      rating: Number(
        form.rating
      ),
    };

    if (
      Object.keys(location)
        .length
    ) {
      payload.location =
        location;
    }

    try {
      if (editing) {
        await api.patch(
          `/admin/records/${identifier}`,
          payload
        );
      } else {
        await api.post(
          "/admin/records",
          payload
        );
      }

      navigate("/admin");
    } catch (err) {
      const message =
        err.response?.data
          ?.errors?.[0]?.message ||
        err.response?.data
          ?.message ||
        "Unable to save record.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container page-section editor-width">
      <Link
        to="/admin"
        className="back-link"
      >
        <ArrowLeft size={16} />
        Admin dashboard
      </Link>

      <div className="panel">
        <div className="page-heading">
          <div>
            <span className="eyebrow">
              {editing
                ? "EDIT RECORD"
                : "NEW RECORD"}
            </span>

            <h1>
              {editing
                ? "Update record"
                : "Create record"}
            </h1>
          </div>
        </div>

        {error && (
          <div className="alert error">
            {error}
          </div>
        )}

        <form
          className="editor-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group full-column">
            <label>Title</label>

            <input
              name="title"
              required
              minLength="2"
              maxLength="160"
              value={form.title}
              onChange={updateField}
            />
          </div>

          <div className="form-group full-column">
            <label>
              Description
            </label>

            <textarea
              name="description"
              required
              minLength="10"
              rows="8"
              value={
                form.description
              }
              onChange={updateField}
            />
          </div>

          <div className="form-group">
            <label>Category</label>

            <select
              name="category"
              value={form.category}
              onChange={updateField}
            >
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
          </div>

          <div className="form-group">
            <label>Status</label>

            <select
              name="status"
              value={form.status}
              onChange={updateField}
            >
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
          </div>

          <div className="form-group full-column">
            <label>Tags</label>

            <input
              name="tags"
              value={form.tags}
              onChange={updateField}
              placeholder="nodejs, mongodb, api"
            />

            <small>
              Separate multiple tags
              with commas.
            </small>
          </div>

          <div className="form-group">
            <label>Price</label>

            <input
              type="number"
              min="0"
              name="price"
              value={form.price}
              onChange={updateField}
            />
          </div>

          <div className="form-group">
            <label>Rating</label>

            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              name="rating"
              value={form.rating}
              onChange={updateField}
            />
          </div>

          <div className="form-group">
            <label>City</label>

            <input
              name="city"
              value={form.city}
              onChange={updateField}
            />
          </div>

          <div className="form-group">
            <label>Country</label>

            <input
              name="country"
              value={form.country}
              onChange={updateField}
            />
          </div>

          <div className="full-column">
            <button
              className="button primary"
              disabled={saving}
            >
              <Save size={17} />

              {saving
                ? "Saving..."
                : editing
                  ? "Save changes"
                  : "Create record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}