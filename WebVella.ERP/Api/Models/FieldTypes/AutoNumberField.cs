﻿using System;

namespace WebVella.ERP.Api.Models
{
	public class AutoNumberField : Field
	{
		public static FieldType FieldType { get { return FieldType.AutoNumberField; } }

		public decimal? DefaultValue { get; set; }

		public string DisplayFormat { get; set; }

		public decimal? StartingNumber { get; set; }
	}

	public class AutoNumberFieldMeta : AutoNumberField
	{
		public Guid EntityId { get; set; }

		public string EntityName { get; set; }

		public AutoNumberFieldMeta(Guid entityId, string entityName, AutoNumberField field)
		{
			EntityId = entityId;
			EntityName = entityName;
			DefaultValue = field.DefaultValue;
			DisplayFormat = field.DisplayFormat;
			StartingNumber = field.StartingNumber;
		}
	}
}