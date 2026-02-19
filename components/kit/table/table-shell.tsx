import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export interface TableShellProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  toolbar?: React.ReactNode;
  footer?: React.ReactNode;
}

export function TableShell({ title, description, toolbar, footer, className, children, ...props }: TableShellProps) {
  return (
    <Card className={cn("overflow-hidden flex flex-col", className)} {...props}>
      {(title || description || toolbar) ? (
        <CardHeader className="space-y-3 py-2">
          <div>
            {title ? <h3 className="text-lg font-semibold">{title}</h3> : null}
            {/* {description ? <p className="text-sm text-muted-foreground">{description}</p> : null} */}
          </div>
          {toolbar ? <div>{toolbar}</div> : null}
        </CardHeader>
      ) : null}
      <CardContent className="space-y-4 flex flex-col max-h-[calc(100vh-20px) h-full overflow-hidden">
        {<div className="grow! flex flex-col overflow-auto">{children}</div>}
        {footer ? <div>{footer}</div> : null}
      </CardContent>
    </Card>
  );
}
