import {
  type FieldMetadata,
  unstable_useControl as useControl,
} from "@conform-to/react";
import {
  type ComponentProps,
  type ElementRef,
  type ReactNode,
  useRef,
} from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export function FormSelect({
  meta,
  items,
  placeholder,
  ...props
}: {
  meta: FieldMetadata<string>;
  items: Array<{ content?: ReactNode; name: string; value: string }>;
  placeholder: string;
} & ComponentProps<typeof Select>) {
  const selectRef = useRef<ElementRef<typeof SelectTrigger>>(null);
  const control = useControl(meta);

  return (
    <>
      <Select
        {...props}
        value={control.value ?? ""}
        onValueChange={control.change}
        onOpenChange={(open) => {
          if (!open) {
            control.blur();
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => {
            return (
              <SelectItem key={item.value} value={item.value}>
                {item.content ?? item.name}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </>
  );
}
