import { useRef, useState } from "react";
import { Item } from "../../model/git-item";
import ReactPaginate from "react-paginate";
import LoadingSpinner from "../loading-spinner/loading-spinner";
import "./search.css";

const API_DOMAIN = "https://api.github.com/search/repositories?";

function Search() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const throttling = useRef(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const itemParPage = 20;
  const totalPageCount = Math.ceil(totalCount / itemParPage);

  const handleThrottleSearch = async () => {
    if (throttling.current) {
      return;
    }
    // If there is no search text, don't make API call
    if (!inputRef.current?.value.trim()) {
      setItems([]);
      setTotalCount(0);
      return;
    }

    throttling.current = true;
    setTimeout(() => {
      throttling.current = false;

      setLoading(true);
      fetch(
        `${API_DOMAIN}q=${inputRef.current?.value}&order=asc&per_page=${itemParPage}`
      )
        .then(async (response) => {
          if (!response.ok) {
            console.log("Something went wrong!");
          } else {
            const data = await response.json();
            setItems(data.items);
            setTotalCount(data.total_count);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }, 700);
  };

  const handlePageChangeClick = async (data: any) => {
    setLoading(true);
    const currentPage = data.selected + 1;
    await fetch(
      `${API_DOMAIN}q=${inputRef.current?.value}&order=asc&per_page=${itemParPage}&page=${currentPage}`
    )
      .then(async (response) => {
        if (!response.ok) {
          console.log("Something went wrong!");
        } else {
          const data = await response.json();
          setItems(data.items);
          setTotalCount(data.total_count);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  return (
    <div>
      <div className="search">
        <input
          type="search"
          ref={inputRef}
          className="search-box"
          placeholder="Search repositories"
          onChange={handleThrottleSearch}
        ></input>
      </div>
      {loading && <LoadingSpinner />}
      <div className="repo-list">
        {items.map((item) => {
          return (
            <div key={item.id} className="repo">
              <div className="repo-owner-image">
                <img src={item.owner.avatar_url} alt={item.name} />
              </div>
              <div className="repo-info">
                <h2>{item.full_name}</h2>
                <h4>{item.description}</h4>
                <a href={item.clone_url} target="_blank" rel="noreferrer">
                  {item.name}
                </a>
              </div>
            </div>
          );
        })}
      </div>
      {items && items.length > 0 && (
        <ReactPaginate
          previousLabel="<<"
          nextLabel=">>"
          breakLabel="..."
          pageCount={totalPageCount}
          pageRangeDisplayed={4}
          onPageChange={handlePageChangeClick}
          containerClassName="pagination"
          pageLinkClassName="page-item"
          nextLinkClassName="page-item"
          previousLinkClassName="page-item"
          activeLinkClassName="active"
          renderOnZeroPageCount={undefined}
        ></ReactPaginate>
      )}
    </div>
  );
}

export default Search;
