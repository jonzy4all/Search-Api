import {
  Filter,
  RotateCcw,
  Search,
} from "lucide-react";

const categories = [
  "",
  "technology",
  "education",
  "health",
  "finance",
  "travel",
  "business",
  "entertainment",
  "other",
];

export default function SearchFilters({
  filters,
  setFilters,
  onSubmit,
  onReset,
}) {
  const updateField = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  return (
    <form
      className="filters-panel"
      onSubmit={onSubmit}
    >
      <div className="filter-heading">
        <div>
          <Filter size={19} />
          <strong>
            Search filters
          </strong>
        </div>

        <button
          type="button"
          className="text-button"
          onClick={onReset}
        >
          <RotateCcw size={15} />
          Reset
        </button>
      </div>

      <div className="search-field">
        <Search size={19} />

        <input
          name="search"
          value={filters.search}
          onChange={updateField}
          placeholder="Search title, description or tags..."
        />
      </div>

      <div className="filter-grid">
        <div className="form-group">
          <label>Category</label>

          <select
            name="category"
            value={filters.category}
            onChange={updateField}
          >
            {categories.map(
              (category) => (
                <option
                  key={
                    category || "all"
                  }
                  value={category}
                >
                  {category
                    ? category
                        .charAt(0)
                        .toUpperCase() +
                      category.slice(1)
                    : "All categories"}
                </option>
              )
            )}
          </select>
        </div>

        <div className="form-group">
          <label>Tags</label>

          <input
            name="tags"
            value={filters.tags}
            onChange={updateField}
            placeholder="nodejs, api"
          />
        </div>

        <div className="form-group">
          <label>Minimum price</label>

          <input
            type="number"
            min="0"
            name="minPrice"
            value={filters.minPrice}
            onChange={updateField}
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label>Maximum price</label>

          <input
            type="number"
            min="0"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={updateField}
            placeholder="50000"
          />
        </div>

        <div className="form-group">
          <label>Minimum rating</label>

          <select
            name="minRating"
            value={filters.minRating}
            onChange={updateField}
          >
            <option value="">
              Any rating
            </option>

            <option value="1">
              1+
            </option>

            <option value="2">
              2+
            </option>

            <option value="3">
              3+
            </option>

            <option value="4">
              4+
            </option>

            <option value="5">
              5
            </option>
          </select>
        </div>

        <div className="form-group">
          <label>City</label>

          <input
            name="city"
            value={filters.city}
            onChange={updateField}
            placeholder="Lagos"
          />
        </div>

        <div className="form-group">
          <label>Country</label>

          <input
            name="country"
            value={filters.country}
            onChange={updateField}
            placeholder="Nigeria"
          />
        </div>

        <div className="form-group">
          <label>Sort by</label>

          <select
            name="sortBy"
            value={filters.sortBy}
            onChange={updateField}
          >
            <option value="relevance">
              Relevance
            </option>

            <option value="createdAt">
              Newest
            </option>

            <option value="updatedAt">
              Recently updated
            </option>

            <option value="title">
              Title
            </option>

            <option value="price">
              Price
            </option>

            <option value="rating">
              Rating
            </option>
          </select>
        </div>

        <div className="form-group">
          <label>Order</label>

          <select
            name="sortOrder"
            value={filters.sortOrder}
            onChange={updateField}
          >
            <option value="desc">
              Descending
            </option>

            <option value="asc">
              Ascending
            </option>
          </select>
        </div>

        <div className="form-group">
          <label>Created from</label>

          <input
            type="date"
            name="createdFrom"
            value={
              filters.createdFrom
            }
            onChange={updateField}
          />
        </div>

        <div className="form-group">
          <label>Created to</label>

          <input
            type="date"
            name="createdTo"
            value={filters.createdTo}
            onChange={updateField}
          />
        </div>
      </div>

      <button
        className="button primary filter-button"
        type="submit"
      >
        <Search size={17} />
        Search records
      </button>
    </form>
  );
}