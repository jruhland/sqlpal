import { createThemeAction } from "remix-themes";

import { connectionSessionResolver } from "~/lib/connection.server";

export const action = createThemeAction(connectionSessionResolver);
