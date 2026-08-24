import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool";
import { requireRegisteredUser } from "../middleware/auth";

const settingsRouter = Router();

type HomeProfileRow = {
  user_id: string;
  home_name: string;
  address: string | null;
  timezone: string;
  updated_at: string;
};

const homeProfileSchema = z
  .object({
    homeName: z.string().trim().min(2).max(80).optional(),
    address: z.string().trim().max(200).nullable().optional(),
    timezone: z.string().trim().min(1).max(80).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one home profile field must be provided.",
  });

function mapHomeProfile(row: HomeProfileRow) {
  return {
    userId: row.user_id,
    homeName: row.home_name,
    address: row.address,
    timezone: row.timezone,
    updatedAt: row.updated_at,
  };
}

settingsRouter.use(requireRegisteredUser);

settingsRouter.get("/settings/home", async (req, res) => {
  const user = req.auth!.user!;

  try {
    const result = await pool.query<HomeProfileRow>(
      `INSERT INTO home_profiles (user_id, home_name)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE
       SET user_id = EXCLUDED.user_id
       RETURNING user_id, home_name, address, timezone, updated_at`,
      [user.id, `${user.name}'s Home`],
    );

    return res.status(200).json(mapHomeProfile(result.rows[0]));
  } catch (error) {
    console.error("Failed to fetch home profile", error);
    return res.status(500).json({ error: "Failed to fetch home profile." });
  }
});

settingsRouter.patch("/settings/home", async (req, res) => {
  const parsed = homeProfileSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid home profile.",
      details: parsed.error.format(),
    });
  }

  const user = req.auth!.user!;

  try {
    const existingResult = await pool.query<HomeProfileRow>(
      `INSERT INTO home_profiles (user_id, home_name)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE
       SET user_id = EXCLUDED.user_id
       RETURNING user_id, home_name, address, timezone, updated_at`,
      [user.id, `${user.name}'s Home`],
    );
    const existing = existingResult.rows[0];
    const result = await pool.query<HomeProfileRow>(
      `UPDATE home_profiles
       SET home_name = $2, address = $3, timezone = $4
       WHERE user_id = $1
       RETURNING user_id, home_name, address, timezone, updated_at`,
      [
        user.id,
        parsed.data.homeName ?? existing.home_name,
        parsed.data.address === undefined
          ? existing.address
          : parsed.data.address || null,
        parsed.data.timezone ?? existing.timezone,
      ],
    );

    return res.status(200).json(mapHomeProfile(result.rows[0]));
  } catch (error) {
    console.error("Failed to update home profile", error);
    return res.status(500).json({ error: "Failed to update home profile." });
  }
});

export default settingsRouter;
