import React from 'react';
import {
    Box,
    TextField,
    InputAdornment,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Stack,
    useTheme
} from '@mui/material';
import {
    Search as SearchIcon,
    Clear as ClearIcon
} from '@mui/icons-material';

interface SearchBarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    placeholder?: string;
    filters?: {
        [key: string]: {
            value: string;
            options: { value: string; label: string }[];
            onChange: (value: string) => void;
        };
    };
}

const SearchBar: React.FC<SearchBarProps> = ({
    searchTerm,
    onSearchChange,
    placeholder = 'Ara...',
    filters
}) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                p: 2,
                mb: 3,
                borderRadius: 1,
                bgcolor: 'background.paper',
                boxShadow: theme.shadows[1]
            }}
        >
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems="center"
            >
                <TextField
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={placeholder}
                    variant="outlined"
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                        endAdornment: searchTerm && (
                            <InputAdornment position="end">
                                <IconButton
                                    size="small"
                                    onClick={() => onSearchChange('')}
                                >
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                    sx={{
                        bgcolor: 'background.default',
                        '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                                borderColor: theme.palette.primary.main,
                            },
                        },
                    }}
                />

                {filters && Object.entries(filters).map(([key, filter]) => (
                    <FormControl
                        key={key}
                        size="small"
                        sx={{ minWidth: 120 }}
                    >
                        <InputLabel>{key}</InputLabel>
                        <Select
                            value={filter.value}
                            onChange={(e) => filter.onChange(e.target.value)}
                            label={key}
                        >
                            {filter.options.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ))}
            </Stack>
        </Box>
    );
};

export default SearchBar; 