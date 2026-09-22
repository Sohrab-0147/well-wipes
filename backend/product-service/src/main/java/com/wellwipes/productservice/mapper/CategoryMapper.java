package com.wellwipes.productservice.mapper;

import com.wellwipes.productservice.domain.Category;
import com.wellwipes.productservice.dto.CategoryResponse;
import com.wellwipes.productservice.dto.CreateCategoryRequest;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CategoryMapper {

    CategoryResponse toResponse(Category category);

    Category toEntity(CreateCategoryRequest request);
}
