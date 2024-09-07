import { styled, alpha } from "@mui/material/styles";
import { TableCell, TableRow, Paper } from "@mui/material";

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.info.light, 0.1),
  color: theme.palette.common.black,
  fontSize: 16,
  fontWeight: "bold",
}));

export const BodyTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: 14,
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}));

export const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[3],
}));

export const StyledTableContainer = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  boxShadow: theme.shadows[2],
}));
