import { v4 as generatorId } from "uuid";
import { useHttp } from "../../hooks/http.hook";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import { heroCreating } from "../../components/heroesList/heroesSlice";
import { selectAll } from "../heroesFilters/filtersSlice";

import store from "../../store";
// Задача для этого компонента:
// Реализовать создание нового героя с введенными данными. Он должен попадать
// в общее состояние и отображаться в списке + фильтроваться
// Уникальный идентификатор персонажа можно сгенерировать через uiid
// Усложненная задача:
// Персонаж создается и в файле json при помощи метода POST
// Дополнительно:
// Элементы <option></option> желательно сформировать на базе
// данных из фильтров

const HeroesAddForm = () => {
  const { filtersLoadingStatus } = useSelector(({ filters }) => filters);
  const dispatch = useDispatch();
  const { request } = useHttp();

  const validate = (values) => {
    const errors = {};
    if (!values.name) {
      errors.name = "Required";
    } else if (values.name.length > 15) {
      errors.name = "Must be 15 characters or less";
    }

    if (!values.description) {
      errors.description = "Required";
    } else if (values.description.length > 20) {
      errors.description = "Must be 20 characters or less";
    }

    if (!values.element) {
      errors.element = "Required";
    }

    return errors;
  };

  const formik = useFormik({
    initialValues: {
      id: "",
      name: "",
      description: "",
      element: "",
    },
    validate,
    onSubmit: (values, { resetForm }) => {
      const hero = { ...values, id: generatorId() };

      request(`http://localhost:3004/heroes`, "POST", `${JSON.stringify(hero)}`)
        .then(dispatch(heroCreating(hero)))
        .catch((error) => console.log(error));

      resetForm({
        id: "",
        name: "",
        description: "",
        element: "",
      });
    },
  });

  const options = (arr) =>
    arr.map(({ text, id, element }) => {
      // eslint-disable-next-line
      if (element === "all") return;

      return (
        <option key={id} value={element}>
          {text[1]}
        </option>
      );
    });

  const filters = selectAll(store.getState());

  const elements = options(filters);

  const styleValidErr = { color: "red", textAlign: "center", textTransform: "uppercase", fontSize: "12px" };

  if (filtersLoadingStatus === "loading") {
    return " ";
  } else if (filtersLoadingStatus === "error") {
    return <h5 className="text-center mt-5">Ошибка загрузки</h5>;
  }

  return (
    <form style={{ textAlign: "start" }} className="border p-4 shadow-lg rounded" onSubmit={formik.handleSubmit}>
      <div className="mb-3">
        <label htmlFor="name" className="form-label fs-4">
          Имя нового героя
        </label>
        <input
          type="text"
          name="name"
          className="form-control"
          id="name"
          placeholder="Как меня зовут?"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.name && formik.errors.name ? <div style={styleValidErr}>{formik.errors.name}</div> : null}
      </div>

      <div className="mb-3">
        <label htmlFor="description" className="form-label fs-4">
          Описание
        </label>
        <textarea
          name="description"
          className="form-control"
          id="description"
          placeholder="Что я умею?"
          style={{ height: "130px" }}
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.description && formik.errors.description ? (
          <div style={styleValidErr}>{formik.errors.description}</div>
        ) : null}
      </div>

      <div className="mb-3">
        <label htmlFor="element" className="form-label">
          Выбрать элемент героя
        </label>
        <select
          className="form-select"
          id="element"
          name="element"
          value={formik.values.element}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        >
          <option value={""} disabled>
            Я владею элементом...
          </option>
          {elements}
        </select>
        {formik.touched.element && formik.errors.element ? (
          <div style={styleValidErr}>{formik.errors.element}</div>
        ) : null}
      </div>

      <button type="submit" className="btn btn-primary">
        Создать
      </button>
    </form>
  );
};

export default HeroesAddForm;
