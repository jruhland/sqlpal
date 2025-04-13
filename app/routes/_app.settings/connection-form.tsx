import {
  getFormProps,
  getInputProps,
  unstable_useControl as useControl,
  useForm,
} from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form } from "react-router";
import { ConnectionIcon } from "~/components/connection-icon";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import type { connections } from "~/db/schema.server";
import {
  connectionDrivers,
  createConnectionSchema,
  updateConnectionSchema,
} from "~/modules/connections";
import type { Route } from "./+types/route";

type ConnectionFormProps = {
  actionData: Route.ComponentProps["actionData"];
} & (
  | {
      intent: "create-connection";
    }
  | {
      intent: "edit-connection";
      connection: typeof connections.$inferSelect;
    }
);

export function ConnectionForm({ actionData, ...props }: ConnectionFormProps) {
  const { intent } = props;

  const [form, fields] = useForm({
    lastResult: actionData,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema:
          intent === "create-connection"
            ? createConnectionSchema
            : updateConnectionSchema,
      });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const config = fields.config.getFieldset();
  const driver = useControl({
    ...config.driver,
    initialValue:
      intent === "edit-connection"
        ? props.connection?.driver
        : connectionDrivers[0],
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Add Connection</Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[425px]">
        <SheetHeader>
          <SheetTitle>
            {intent === "create-connection"
              ? "Create Connection"
              : "Edit Connection"}
          </SheetTitle>
        </SheetHeader>
        <div className="px-4 -mt-4">
          <Form
            method="POST"
            {...getFormProps(form)}
            className="grid gap-3"
            data-1p-ignore
            autoComplete="off"
          >
            {intent === "edit-connection" && (
              <Input
                aria-hidden
                name="id"
                type="hidden"
                value={props.connection.id}
              />
            )}
            <div className="grid gap-3">
              <Label htmlFor={fields.name.name}>Name</Label>
              <Input {...getInputProps(fields.name, { type: "text" })} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor={config.driver.name}>Driver</Label>
              <Select
                name={config.driver.name}
                value={driver.value}
                onValueChange={driver.change}
                onOpenChange={(open) => {
                  if (!open) {
                    driver.blur();
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a driver" />
                </SelectTrigger>
                <SelectContent>
                  {connectionDrivers.map((driver) => (
                    <SelectItem key={driver} value={driver}>
                      <ConnectionIcon className="h-4 w-4" driver={driver} />
                      {driver}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {["postgres", "mysql"].includes(driver.value ?? "") && (
              <>
                <div className="grid gap-3">
                  <Label htmlFor={config.host.name}>Host</Label>
                  <Input {...getInputProps(config.host, { type: "text" })} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor={config.port.name}>Port</Label>
                  <Input
                    {...getInputProps(config.port, {
                      type: "number",
                    })}
                    defaultValue={driver.value === "postgres" ? 5432 : 3306}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor={config.database.name}>Database</Label>
                  <Input
                    {...getInputProps(config.database, { type: "text" })}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor={config.username.name}>Username</Label>
                  <Input
                    {...getInputProps(config.username, { type: "text" })}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor={config.password.name}>Password</Label>
                  <Input
                    {...getInputProps(config.password, { type: "password" })}
                  />
                </div>
              </>
            )}
            {driver.value === "sqlite" && (
              <div className="grid gap-3">
                <Label htmlFor={config.filename.name}>Filename</Label>
                <Input {...getInputProps(config.filename, { type: "text" })} />
              </div>
            )}
            {driver.value === "cassandra" && (
              <>
                <div className="grid gap-3">
                  <Label htmlFor={config.keyspace.name}>Keyspace</Label>
                  <Input
                    {...getInputProps(config.keyspace, { type: "text" })}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor={config.contactPoints.name}>
                    Contact Points
                  </Label>
                  <Input
                    {...getInputProps(config.contactPoints, { type: "text" })}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor={config.localDataCenter.name}>
                    Local Data Center
                  </Label>
                  <Input
                    {...getInputProps(config.localDataCenter, { type: "text" })}
                  />
                </div>
              </>
            )}
            <SheetFooter>
              <Button type="submit" name="intent" value={intent}>
                {intent === "create-connection"
                  ? "Create Connection"
                  : "Update Connection"}
              </Button>
              <Button
                type="button"
                name="intent"
                value="delete-connection"
                variant="destructive"
              >
                Delete Connection
              </Button>
            </SheetFooter>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
