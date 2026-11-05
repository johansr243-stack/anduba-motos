import { dbGetSalesSummary } from "../services/report.service.js";

const getSalesSummary = async (req, res) => {
  try {
    const data = await dbGetSalesSummary();

    res.json({
      msg: "Resumen de ventas",
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "No se pudo calcular el resumen de ventas" });
  }
};

export { getSalesSummary };
