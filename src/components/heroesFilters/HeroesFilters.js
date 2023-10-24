import { useHttp } from "../../hooks/http.hook";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import { filtersFetching, filtersFetched, filtersFetchingError, heroesFilters } from "../../actions";

// Задача для этого компонента:
// Фильтры должны формироваться на основании загруженных данных
// Фильтры должны отображать только нужных героев при выборе
// Активный фильтр имеет класс active
// Изменять json-файл для удобства МОЖНО!
// Представьте, что вы попросили бэкенд-разработчика об этом

const HeroesFilters = () => {
  const { filters, filtersLoadingStatus } = useSelector(({ filters }) => filters);
  const dispatch = useDispatch();
  const { request } = useHttp();

  useEffect(() => {
    dispatch(filtersFetching());
    request("http://localhost:3004/filters")
      .then((data) => dispatch(filtersFetched(data)))
      .catch(() => dispatch(filtersFetchingError()));

    // eslint-disable-next-line
  }, []);

  const refs = useRef([]);

  const activeButton = (index, filter) => {
    refs.current.forEach((item) => {
      item.classList.remove("active");
    });
    refs.current[index].classList.add("active");

    dispatch(heroesFilters(filter));
  };

  const buttons = (arr) =>
    arr.map(({ classNames, text, id, element }, index) => {
      return (
        <button
          onClick={() => activeButton(index, element)}
          ref={(elem) => {
            refs.current[index] = elem;
          }}
          key={id}
          className={classNames}
        >
          {text[0]}
        </button>
      );
    });

  const elements = buttons(filters);

  if (filtersLoadingStatus === "loading") {
    return "Загрузка фильтров...";
  } else if (filtersLoadingStatus === "error") {
    return <h5 className="text-center mt-5">Ошибка загрузки</h5>;
  }

  return (
    <div className="card shadow-lg mt-4">
      <div className="card-body">
        <p className="card-text">Отфильтруйте героев по элементам</p>
        <div className="btn-group">{elements}</div>
      </div>
    </div>
  );
};

export default HeroesFilters;
