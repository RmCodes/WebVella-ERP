﻿using System;

namespace WebVella.ERP.Api.Models
{
    public class PercentField : Field
    {
        public static FieldType FieldType { get { return FieldType.PercentField; } }

        public decimal? DefaultValue { get; set; }

        public decimal? MinValue { get; set; }

        public decimal? MaxValue { get; set; }

        public byte? DecimalPlaces { get; set; }
    }

    public class PercentFieldMeta : PercentField
    {
		public Guid EntityId { get; set; }

		public string EntityName { get; set; }

		public PercentFieldMeta(Guid entityId, string entityName, PercentField field)
		{
			EntityId = entityId;
			EntityName = entityName;
			MinValue = field.MinValue;
			MaxValue= field.MaxValue;
			DecimalPlaces = field.DecimalPlaces;
        }
	}
}