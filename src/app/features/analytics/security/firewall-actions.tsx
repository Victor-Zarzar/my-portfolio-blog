import { useTranslations } from "next-intl";
import type { FirewallActionsProps } from "@/app/shared/types/analytics/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/shared/ui/table";

export function FirewallActions({ data }: FirewallActionsProps) {
  const t = useTranslations("dashboard.analytics.security");

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>{t("actions.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("actions.rule")}</TableHead>
                <TableHead>{t("actions.action")}</TableHead>
                <TableHead>{t("actions.host")}</TableHead>
                <TableHead className="text-right">
                  {t("actions.count")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.ruleName ?? "-"}
                    </TableCell>
                    <TableCell>{item.action}</TableCell>
                    <TableCell className="max-w-60 truncate">
                      {item.host ?? "-"}
                    </TableCell>
                    <TableCell className="text-right">{item.count}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {t("actions.empty")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
